import { prisma } from "../../lib/prisma";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";

const getDashboardStats = async () => {
  const [
    totalUsers,
    totalProviders,
    totalCustomers,
    totalOrders,
    totalRevenue,
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
    revenue: totalRevenue._sum.totalAmount || 0,
  };
};

const getAllUsers = async (options: any) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationSortingHelper(options);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
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
  const { page, limit, skip, sortBy, sortOrder } =
    paginationSortingHelper(options);

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

export const adminService = {
  getDashboardStats,
  getAllUsers,
  getAllOrders,
};
