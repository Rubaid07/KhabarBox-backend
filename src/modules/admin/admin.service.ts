import { prisma } from "../../lib/prisma";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { UserRole } from "../../middleware/auth";

const getDashboardStats = async () => {
  const [
    totalUsers,
    totalProviders,
    totalCustomers,
    totalOrders,
    totalRevenueAgg,
    pendingOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "PROVIDER" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.orders.count(),
    prisma.orders.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { totalAmount: true },
    }),
    prisma.orders.count({
      where: { status: { in: ["PLACED", "PREPARING"] } },
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      providers: totalProviders,
      customers: totalCustomers,
    },
    orders: {
      total: totalOrders,
      pending: pendingOrders,
    },
    revenue: Number(totalRevenueAgg._sum.totalAmount) || 0,
  };
};

const getAllUsers = async (options: any) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(options);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        providerProfile: {
          select: {
            restaurantName: true,
            address: true,
            logoUrl: true,
            isVerified: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.user.count(),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: users,
  };
};

const getAllOrders = async (options: any) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(options);

  const [orders, total] = await Promise.all([
    prisma.orders.findMany({
      include: {
        customer: {
          select: { name: true, email: true },
        },
        provider: {
          include: {
            providerProfile: {
              select: { restaurantName: true },
            },
          },
        },
        orderItems: {
          include: {
            meal: { select: { name: true } },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.orders.count(),
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

const suspendUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");
  if (user.role === "ADMIN") throw new Error("Cannot suspend admin");

  return prisma.user.update({
    where: { id: userId },
    data: { status: "SUSPENDED" },
  });
};

const activateUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  return prisma.user.update({
    where: { id: userId },
    data: { status: "ACTIVE" },
  });
};

const deleteUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      providerOrders: { where: { status: { not: "DELIVERED" } } },
      customerOrders: { where: { status: { not: "DELIVERED" } } },
    },
  });

  if (!user) throw new Error("User not found");
  if (user.role === "ADMIN") throw new Error("Cannot delete admin");

  const pendingOrders =
    user.role === UserRole.PROVIDER
      ? user.providerOrders.length
      : user.customerOrders.length;

  if (pendingOrders > 0) {
    throw new Error("User has pending orders");
  }

  return prisma.user.delete({ where: { id: userId } });
};

const updateOrderStatus = async (orderId: string, status: string) => {
  const order = await prisma.orders.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");

  const validStatuses = ["PLACED", "PREPARING", "READY", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status");
  }

  return prisma.orders.update({
    where: { id: orderId },
    data: { status: status as any },
  });
};

const cancelOrder = async (orderId: string) => {
  const order = await prisma.orders.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");

  if (order.status === "DELIVERED" || order.status === "CANCELLED") {
    throw new Error("Cannot cancel this order");
  }

  return prisma.orders.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });
};

const getRevenueTrend = async (days: number = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const orders = await prisma.orders.findMany({
    where: {
      createdAt: { gte: startDate },
      status: { not: "CANCELLED" },
    },
    select: {
      createdAt: true,
      totalAmount: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const grouped = orders.reduce((acc: Record<string, { revenue: number, count: number }>, order) => {
    const date = order.createdAt.toISOString().split("T")[0];
    
    if (!date) return acc;

    const amount = Number(order.totalAmount) || 0;
    
    if (!acc[date]) {
      acc[date] = { revenue: 0, count: 0 };
    }
    
    acc[date].revenue += amount;
    acc[date].count += 1;
    return acc;
  }, {});

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0] as string;
    
    const dayData = grouped[dateStr] || { revenue: 0, count: 0 };
    
    result.push({
      date: dateStr,
      revenue: dayData.revenue,
      orders: dayData.count,
    });
  }

  return result;
};

const getRecentOrders = async (limit: number = 10) => {
  const orders = await prisma.orders.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      customer: {
        select: { name: true, email: true },
      },
      provider: {
        include: {
          providerProfile: {
            select: { restaurantName: true },
          },
        },
      },
    },
  });

  return orders.map(order => ({
    ...order,
    totalAmount: Number(order.totalAmount) || 0,
  }));
};

const getTopProviders = async (limit: number = 5) => {
  const providers = await prisma.orders.groupBy({
    by: ["providerId"],
    where: {
      status: { not: "CANCELLED" },
    },
    _sum: { totalAmount: true },
    _count: { id: true },
    orderBy: { _sum: { totalAmount: "desc" } },
    take: limit,
  });

  const providerIds = providers.map((p) => p.providerId);
  const providerDetails = await prisma.user.findMany({
    where: { id: { in: providerIds } },
    include: {
      providerProfile: {
        select: { restaurantName: true, logoUrl: true },
      },
    },
  });

  return providers.map((p) => {
    const detail = providerDetails.find((d) => d.id === p.providerId);
    return {
      id: p.providerId,
      restaurantName: detail?.providerProfile?.restaurantName || "Unknown",
      logoUrl: detail?.providerProfile?.logoUrl,
      totalRevenue: Number(p._sum.totalAmount) || 0,
      totalOrders: p._count.id,
    };
  });
};

const getOrderStatusBreakdown = async () => {
  const statuses = ["PLACED", "PREPARING", "READY", "DELIVERED", "CANCELLED"] as const;
  
  const counts = await Promise.all(
    statuses.map((status) =>
      prisma.orders.count({ 
        where: { 
          status: status as any
        } 
      })
    )
  );

  return statuses.map((status, index) => ({
    name: status,
    value: counts[index],
    color: getStatusColor(status),
  }));
};

const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    PLACED: "#3b82f6",
    PREPARING: "#f59e0b",
    READY: "#8b5cf6",
    DELIVERED: "#10b981",
    CANCELLED: "#ef4444",
  };
  return colors[status] || "#6b7280";
};

export const adminService = {
  getDashboardStats,
  getRevenueTrend,
  getRecentOrders,
  getTopProviders,
  getOrderStatusBreakdown,
  getAllUsers,
  getAllOrders,
  suspendUser,
  activateUser,
  deleteUser,
  updateOrderStatus,
  cancelOrder
};