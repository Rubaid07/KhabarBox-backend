import { OrderStatus } from "../../../generated/prisma/enums";
import { OrdersCreateInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middleware/auth";

const placeOrder = async (
  customerId: string,
  data: Pick<OrdersCreateInput, "deliveryAddress">
) => {
  const { deliveryAddress } = data;

  const cartItems = await prisma.cartItem.findMany({
    where: { customerId },
    include: { meal: true },
  });

  if (cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  // group by provider
  const itemsByProvider = cartItems.reduce((acc, item) => {
    const providerId = item.meal.providerId;
    if (!acc[providerId]) acc[providerId] = [];
    acc[providerId].push(item);
    return acc;
  }, {} as Record<string, typeof cartItems>);

  const orders = [];

  // create order for each provider
  for (const [providerId, items] of Object.entries(itemsByProvider)) {
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.meal.price) * item.quantity,
      0
    );

    const order = await prisma.orders.create({
      data: {
        customerId,
        providerId,
        totalAmount,
        deliveryAddress,
        status: "PLACED",
        paymentMethod: "COD",
        orderItems: {
          create: items.map((item) => ({
            mealId: item.mealId,
            quantity: item.quantity,
            priceAtTime: item.meal.price,
          })),
        },
      },
      include: {
        orderItems: { include: { meal: true } },
        provider: {
          select: {
            providerProfile: { select: { restaurantName: true } },
          },
        },
      },
    });

    orders.push(order);
  }
  // Clear cart
  await prisma.cartItem.deleteMany({ where: { customerId } });

  return orders;
};

const getMyOrders = async (customerId: string) => {
  return prisma.orders.findMany({
    where: { customerId },
    include: {
      orderItems: {
        include: { 
          meal: { 
            select: { 
              name: true, 
              imageUrl: true 
            } 
          } 
        },
      },
      provider: {
        include: {
          providerProfile: {
            select: {
              restaurantName: true,
              address: true,
              logoUrl: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getProviderOrders = async (providerId: string) => {
  return prisma.orders.findMany({
    where: { providerId },
    include: {
      orderItems: {
        include: { meal: { select: { name: true, imageUrl: true } } },
      },
      customer: { select: { name: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getOrderById = async (orderId: string, userId: string, userRole: string) => {
  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    include: {
      orderItems: { include: { meal: true } },
      customer: { select: { id: true, name: true, phone: true } },
      provider: {
        select: {
          id: true,
          providerProfile: { select: { restaurantName: true, address: true } },
        },
      },
    },
  });

  if (!order) throw new Error("Order not found");

  const isOwner = order.customerId === userId || order.providerId === userId;
  const isAdmin = userRole === UserRole.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new Error("Not authorized");
  }

  return order;
};

const updateStatus = async (
  orderId: string,
  providerId: string,
  newStatus: OrderStatus
) => {
  const order = await prisma.orders.findFirst({
    where: { id: orderId, providerId },
  });

  if (!order) throw new Error("Order not found");

  const transitions: Record<OrderStatus, OrderStatus[]> = {
    PLACED: ["PREPARING", "CANCELLED"],
    PREPARING: ["READY", "CANCELLED"],
    READY: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
  };

  const allowed = transitions[order.status] ?? [];
  
  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot change from ${order.status} to ${newStatus}`);
  }

  return prisma.orders.update({
    where: { id: orderId },
    data: { status: newStatus },
  });
};

export const orderService = {
    placeOrder,
    getMyOrders,
    getProviderOrders,
    getOrderById,
    updateStatus
}