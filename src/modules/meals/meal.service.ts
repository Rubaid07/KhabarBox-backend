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
  categoryId
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

  if(providerId){
    andConditions.push({ providerId })
  }

  if (categoryId) {
    andConditions.push({ categoryId });
  }

  return prisma.meal.findMany({
    where: {
      AND: andConditions,
    },
  });
};

export const mealService = {
  createMela,
  getAllMeal,
};
