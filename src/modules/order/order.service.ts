import { OrderStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middleware/auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

const placeOrder = async (
  customerId: string,
  data: {
    deliveryAddress: string;
    phone?: string;
    notes?: string;
    paymentMethod?: string;
  },
) => {
  const { deliveryAddress, phone, notes, paymentMethod = "COD" } = data;

  const cartItems = await prisma.cartItem.findMany({
    where: { customerId },
    include: { meal: true },
  });

  if (cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  // group by provider
  const itemsByProvider = cartItems.reduce(
    (acc, item) => {
      const providerId = item.meal.providerId;
      if (!acc[providerId]) acc[providerId] = [];
      acc[providerId].push(item);
      return acc;
    },
    {} as Record<string, typeof cartItems>,
  );

  const orders = [];

  // create order for each provider
  for (const [providerId, items] of Object.entries(itemsByProvider)) {
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.meal.price) * item.quantity,
      0,
    );

    const order = await prisma.orders.create({
      data: {
        customerId,
        providerId,
        totalAmount,
        deliveryAddress,
        phone: phone ? String(phone) : "",
        notes: notes || "",
        status: paymentMethod === "STRIPE" ? "PLACED" : "PLACED",
        paymentMethod,
        paymentStatus: paymentMethod === "STRIPE" ? "PENDING" : "COMPLETED",
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

const createStripeCheckoutSession = async (
  customerId: string,
  data: {
    deliveryAddress: string;
    phone?: string;
    notes?: string;
  },
) => {
  const { deliveryAddress, phone, notes } = data;

  // Get cart items
  const cartItems = await prisma.cartItem.findMany({
    where: { customerId },
    include: { meal: true },
  });

  if (cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  // Get customer details
  const customer = await prisma.user.findUnique({
    where: { id: customerId },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  // Group items by provider
  const itemsByProvider = cartItems.reduce(
    (acc, item) => {
      const providerId = item.meal.providerId;
      if (!acc[providerId]) acc[providerId] = [];
      acc[providerId].push(item);
      return acc;
    },
    {} as Record<string, typeof cartItems>,
  );

  // Calculate total amount in cents
  const totalAmountCents = Math.round(
    cartItems.reduce(
      (sum, item) => sum + Number(item.meal.price) * item.quantity,
      0,
    ) * 100,
  );

  // Create line items for Stripe
  const lineItems = cartItems.map((item) => ({
    price_data: {
      currency: "bdt",
      product_data: {
        name: item.meal.name,
        images: item.meal.imageUrl ? [item.meal.imageUrl] : [],
      },
      unit_amount: Math.round(Number(item.meal.price) * 100),
    },
    quantity: item.quantity,
  }));

  const frontendUrl =
    process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:3000";

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    customer_email: customer.email,
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/checkout/cancel`,
    metadata: {
      customerId,
      deliveryAddress: deliveryAddress.substring(0, 500),
      phone: phone || "",
      notes: notes || "",
    },
  });

  return {
    sessionId: session.id,
    url: session.url,
  };
};

const verifyStripePayment = async (
  sessionId: string,
  customerId: string,
  metadata: {
    deliveryAddress: string;
    phone?: string;
    notes?: string;
  },
) => {
  // Retrieve session from Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  // Check if payment is completed
  if (session.payment_status !== "paid") {
    throw new Error("Payment not completed");
  }

  const { deliveryAddress, phone, notes } = metadata;

  // Get cart items
  const cartItems = await prisma.cartItem.findMany({
    where: { customerId },
    include: { meal: true },
  });

  if (cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  // Group items by provider
  const itemsByProvider = cartItems.reduce(
    (acc, item) => {
      const providerId = item.meal.providerId;
      if (!acc[providerId]) acc[providerId] = [];
      acc[providerId].push(item);
      return acc;
    },
    {} as Record<string, typeof cartItems>,
  );

  const orders = [];

  // Create order for each provider
  for (const [providerId, items] of Object.entries(itemsByProvider)) {
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.meal.price) * item.quantity,
      0,
    );

    const order = await prisma.orders.create({
      data: {
        customerId,
        providerId,
        totalAmount,
        deliveryAddress,
        phone: phone ? String(phone) : "",
        notes: notes || "",
        status: "PLACED",
        paymentMethod: "STRIPE",
        paymentStatus: "COMPLETED",
        stripeSessionId: sessionId,
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
              imageUrl: true,
            },
          },
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

const getOrderById = async (
  orderId: string,
  userId: string,
  userRole: string,
) => {
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
  newStatus: OrderStatus,
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

const cancelOrder = async (orderId: string, customerId: string) => {
  const order = await prisma.orders.findFirst({
    where: { id: orderId, customerId },
  });

  if (!order) throw new Error("Order not found");

  if (!["PLACED", "PREPARING"].includes(order.status)) {
    throw new Error("Cannot cancel this order");
  }

  return prisma.orders.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });
};

export const orderService = {
  placeOrder,
  createStripeCheckoutSession,
  verifyStripePayment,
  getMyOrders,
  getProviderOrders,
  getOrderById,
  updateStatus,
  cancelOrder,
};
