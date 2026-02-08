import { prisma } from "../../lib/prisma";
import { AddToCartInput } from "./cart.types";

const addToCart = async (customerId: string, data: AddToCartInput) => {
  const { mealId, quantity } = data;

  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }
  const meal = await prisma.meal.findUnique({
    where: {
      id: mealId,
      isAvailable: true,
    },
  });

  if (!meal) {
    throw new Error("Meal not available");
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      customerId_mealId: { customerId, mealId },
    },
  });

  // Update quantity
  if (existingItem) {
    return prisma.cartItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        quantity: existingItem.quantity + quantity,
      },
      include: { meal: true },
    });
  }

  // Create new cart item
  return prisma.cartItem.create({
    data: {
      customerId,
      mealId,
      quantity,
    },
    include: { meal: true },
  });
};

const getMyCart = async (customerId: string) => {
  const cartItems = await prisma.cartItem.findMany({
    where: { customerId },
    include: {
      meal: {
        include: {
          provider: {
            select: {
              providerProfiles: {
                select: { restaurantName: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate totals
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + Number(item.meal.price) * item.quantity,
    0,
  );

  return {
    items: cartItems,
    meta: {
      totalItems,
      totalAmount: Number(totalAmount.toFixed(2)),
    },
  };
};

const updateQuantity = async (
  cartItemId: string,
  customerId: string,
  quantity: number
) => {
  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  const cartItem = await prisma.cartItem.findFirst({
    where: { id: cartItemId, customerId },
  });

  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  return prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
    include: { meal: true },
  });
};

const removeItem = async (cartItemId: string, customerId: string) => {
  const cartItem = await prisma.cartItem.findFirst({
    where: { id: cartItemId, customerId },
  });

  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  return prisma.cartItem.delete({
    where: { id: cartItemId },
  });
};

const clearCart = async (customerId: string) => {
  return prisma.cartItem.deleteMany({
    where: { customerId },
  });
};


export const cartService = {
  addToCart,
  getMyCart,
  updateQuantity,
  removeItem,
  clearCart
};
