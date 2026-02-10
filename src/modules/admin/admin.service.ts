import { prisma } from "../../lib/prisma";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { UserRole } from "../../middleware/auth";

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

export const adminService = {
  getDashboardStats,
  getAllUsers,
  getAllOrders,
  suspendUser,
  activateUser,
  deleteUser,
  updateOrderStatus,
  cancelOrder
};
