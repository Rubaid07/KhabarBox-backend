import { prisma } from "../../lib/prisma";
import { CreateReviewInput } from "./review.types";

const createReview = async(data: CreateReviewInput & {customerId: string}) => {
    const { mealId, customerId, rating, comment } = data
    if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      mealId_customerId: {
        mealId,
        customerId,
      },
    },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this meal");
  }

  const deliveredOrder = await prisma.orders.findFirst({
    where: {
      customerId,
      orderItems: {
        some: {
          mealId,
        },
      },
      status: "DELIVERED",
    },
  });

  if (!deliveredOrder) {
    throw new Error("You can only review meals from delivered orders");
  }

  const review = await prisma.review.create({
    data: {
      mealId,
      customerId,
      rating,
       comment: comment ?? null,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      meal: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return review;
};

export const reviewService = {
    createReview
}