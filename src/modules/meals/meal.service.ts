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

const getAllMeal = async ({
  search,
  dietaryTags = [],
  isAvailable,
  priceRange,
  providerId,
  categoryId,
  page,
  limit,
  skip,
  sortBy,
  sortOrder,
}: GetMealFilters) => {
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

  if (dietaryTags.length > 0) {
    andConditions.push({
      dietaryTags: { hasEvery: dietaryTags },
    });
  }

  if (typeof isAvailable === "boolean") {
    andConditions.push({ isAvailable });
  }

  if (priceRange) {
    andConditions.push({
      price: {
        ...(priceRange.min !== undefined && { gte: priceRange.min }),
        ...(priceRange.max !== undefined && { lte: priceRange.max }),
      },
    });
  }

  if (providerId) {
    andConditions.push({ providerId });
  }

  if (categoryId) {
    andConditions.push({ categoryId });
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
  return prisma.meal.findUnique({
    where: { id },
    include: {
      provider: {
        select: {
          id: true,
          name: true,
          providerProfiles: {
            select: {
              restaurantName: true,
              address: true,
            },
          },
        },
      },
      category: true,
      reviews: {
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
      },
      _count: {
        select: { reviews: true },
      },
    },
  });
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

export const mealService = {
  createMela,
  getAllMeal,
  getMealById,
  updateMeal
};
