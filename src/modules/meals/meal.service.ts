import { MealWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { CreateMealInput, GetMealFilters } from "./meal.types";

const createMela = async (data: CreateMealInput, userId: string) => {
  const result = await prisma.meal.create({
    data: {
      ...data,
      providerId: userId,
    },
  });
  return result;
};

const getAllMeal = async (filters: GetMealFilters) => {
  const {
    search,
    dietaryTags,
    isAvailable,
    priceRange,
    providerId,
    categoryId,  // Already exists
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  } = filters;
  
  const andConditions: MealWhereInput[] = [];

  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { dietaryTags: { has: search } },
      ],
    });
  }

  // Category/Cuisine Filter
  if (categoryId) {
    andConditions.push({ categoryId });
  }

  if (dietaryTags && dietaryTags.length > 0) {
    andConditions.push({
      dietaryTags: { hasEvery: dietaryTags },
    });
  }

  if (typeof isAvailable === "boolean") {
    andConditions.push({ isAvailable });
  }
  
  if (priceRange) {
    const priceCondition: any = {};
    if (priceRange.min !== undefined)
      priceCondition.gte = Number(priceRange.min);
    if (priceRange.max !== undefined)
      priceCondition.lte = Number(priceRange.max);

    if (Object.keys(priceCondition).length > 0) {
      andConditions.push({ price: priceCondition });
    }
  }

  if (providerId) {
    andConditions.push({ providerId });
  }

  const meal = await prisma.meal.findMany({
    where: {
      AND: andConditions,
    },
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      category: true,  // Include category info
      provider: {
        include: {
          providerProfile: {
            select: { restaurantName: true },
          },
        },
      },
    },
  });

  const total = await prisma.meal.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: meal,
    metaData: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getMealById = async (id: string) => {
  const meal = await prisma.meal.findUnique({
    where: { id },
    include: {
      provider: {
        select: {
          id: true,
          name: true,
          providerProfile: true,
        },
      },
      category: true,
      reviews: {
        include: {
          customer: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!meal) return null;

  const totalRating = meal.reviews.reduce((sum, rev) => sum + rev.rating, 0);
  const averageRating =
    meal.reviews.length > 0
      ? Number((totalRating / meal.reviews.length).toFixed(1))
      : 0;

  return {
    ...meal,
    averageRating,
    totalReviews: meal.reviews.length,
  };
};

const updateMeal = async (id: string, data: Partial<CreateMealInput>) => {
  return prisma.meal.update({
    where: { id },
    data,
    include: {
      category: true,
    },
  });
};

const deleteMeal = async (id: string) => {
  return prisma.meal.delete({
    where: { id },
  });
};

export const mealService = {
  createMela,
  getAllMeal,
  getMealById,
  updateMeal,
  deleteMeal,
};
