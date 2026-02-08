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

export const cartService = {
    addToCart
}