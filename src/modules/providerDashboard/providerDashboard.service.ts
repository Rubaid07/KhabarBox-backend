import { prisma } from "../../lib/prisma";
import { PopularMeal } from "./providerDashboard.types";

const getStats = async (providerId: string) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalOrders,
    totalRevenue,
    pendingOrders,
    totalMeals,
    todayOrders,
    weeklyRevenueData,
  ] = await Promise.all([
    prisma.orders.count({
      where: { providerId },
    }),
    prisma.orders.aggregate({
      where: { providerId },
      _sum: { totalAmount: true },
    }),
    prisma.orders.count({
      where: {
        providerId,
        status: { in: ["PLACED", "PREPARING"] },
      },
    }),
    prisma.meal.count({
      where: { providerId },
    }),
    prisma.orders.count({
      where: {
        providerId,
        createdAt: { gte: today },
      },
    }),
    prisma.orders.aggregate({
      where: {
        providerId,
        createdAt: { gte: weekAgo },
      },
      _sum: { totalAmount: true },
    }),
  ]);

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    pendingOrders,
    totalMeals,
    todayOrders,
    weeklyRevenue: weeklyRevenueData._sum.totalAmount || 0,
  };
};

const getRecentOrders = async (
  providerId: string,
  options: { page: number; limit: number }
) => {
  const { page = 1, limit = 5 } = options;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.orders.findMany({
      where: { providerId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        orderItems: {
          include: {
            meal: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.orders.count({ where: { providerId } }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: orders,
  };
};

const getPopularMeals = async (providerId: string, limit: number = 5) => {
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        providerId,
        status: { not: "CANCELLED" },
      },
    },
    include: {
      meal: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          price: true,
        },
      },
    },
  });

  const mealStats = orderItems.reduce((acc, item) => {
    const mealId = item.mealId;
    if (!acc[mealId]) {
      acc[mealId] = {
        mealId,
        name: item.meal.name,
        imageUrl: item.meal.imageUrl!,
        totalSold: 0,
        revenue: 0,
      };
    }
    acc[mealId].totalSold += item.quantity;
    acc[mealId].revenue += Number(item.priceAtTime) * item.quantity;
    return acc;
  }, {} as Record<string, PopularMeal & { imageUrl: string }>);

  return Object.values(mealStats)
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, limit);
};

const getWeeklyChart = async (providerId: string) => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const orders = await prisma.orders.findMany({
    where: {
      providerId,
      createdAt: { gte: weekAgo },
    },
    select: {
      createdAt: true,
      totalAmount: true,
    },
  });

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
  
  const chartData: { day: string; orders: number; revenue: number }[] = days.map(
    (day) => ({
      day,
      orders: 0,
      revenue: 0,
    })
  );

  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    const dayIndex = date.getDay();
    
    if (dayIndex >= 0 && dayIndex < 7) {
      const dayData = chartData[dayIndex];
      if (dayData) {
        dayData.orders += 1;
        dayData.revenue += Number(order.totalAmount);
      }
    }
  });

  return chartData;
};

export const providerDashboardService = {
  getStats,
  getRecentOrders,
  getPopularMeals,
  getWeeklyChart,
};