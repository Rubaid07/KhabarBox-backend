import { prisma } from "../../lib/prisma";
import { CreateReviewInput, UpdateReviewInput } from "./review.types";

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

const getReviews = async (mealId: string) => {
  const reviews = await prisma.review.findMany({
    where: { mealId },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const avgRating = await prisma.review.aggregate({
    where: { mealId },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  return {
    reviews,
    meta: {
      total: avgRating._count.rating,
      averageRating: avgRating._avg.rating 
        ? Number(avgRating._avg.rating.toFixed(1)) 
        : 0,
    },
  };
};

const getMyReviews = async (customerId: string) => {
  return prisma.review.findMany({
    where: { customerId },
    include: {
      meal: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          provider: {
            select: {
              providerProfiles: {
                select: {
                  restaurantName: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const updateReview = async (
  reviewId: string,
  customerId: string,
  data: UpdateReviewInput
) => {
  const existingReview = await prisma.review.findFirst({
    where: {
      id: reviewId,
      customerId, 
    },
  });

  if (!existingReview) {
    throw new Error("Review not found or not authorized");
  }

  if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
    throw new Error("Rating must be between 1 and 5");
  }

  return prisma.review.update({
    where: { id: reviewId },
    data: {
      ...(data.rating !== undefined && { rating: data.rating }),
      ...(data.comment !== undefined && { comment: data.comment }),
    },
    include: {
      customer: { select: { id: true, name: true, image: true } },
      meal: { select: { id: true, name: true } },
    },
  });
};

const deleteReview = async (
  reviewId: string,
  userId: string,
  userRole: string
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  // Check permission: own review OR admin
  const isOwner = review.customerId === userId;
  const isAdmin = userRole === "ADMIN";

  if (!isOwner && !isAdmin) {
    throw new Error("Not authorized to delete this review");
  }

  return prisma.review.delete({
    where: { id: reviewId },
  });
};

export const reviewService = {
    createReview,
    getReviews,
    getMyReviews,
    updateReview,
    deleteReview
}