import { OrdersCreateInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

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

  const itemsByProvider = cartItems.reduce((acc, item) => {
    const providerId = item.meal.providerId;
    if (!acc[providerId]) acc[providerId] = [];
    acc[providerId].push(item);
    return acc;
  }, {} as Record<string, typeof cartItems>);

  const orders = [];

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
            providerProfiles: { select: { restaurantName: true } },
          },
        },
      },
    });

    orders.push(order);
  }

  await prisma.cartItem.deleteMany({ where: { customerId } });

  return orders;
};

export const orderService = {
    placeOrder
}