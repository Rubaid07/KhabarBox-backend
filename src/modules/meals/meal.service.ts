import { MealWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import {
  CreateMealInput,
  GetMealFilters,
  SuggestionResult,
} from "./meal.types";

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
    categoryId,
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  } = filters;

  const andConditions: MealWhereInput[] = [];

  // ✅ Enhanced search: name, description, tags, AND restaurant name
  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { dietaryTags: { has: search } },
        // ✅ Search by restaurant name through provider -> providerProfile
        {
          provider: {
            providerProfile: {
              restaurantName: { contains: search, mode: "insensitive" },
            },
          },
        },
      ],
    });
  }

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
      category: true,
      provider: {
        include: {
          providerProfile: {
            select: { restaurantName: true, logoUrl: true },
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

const getSuggestions = async (query: string): Promise<SuggestionResult> => {
  if (!query || query.length < 2) {
    return { meals: [], tags: [], restaurants: [] };
  }

  const searchLower = query.toLowerCase();

  const [meals, allMealsForTags, restaurants, categories] = await Promise.all([
    prisma.meal.findMany({
      where: {
        isAvailable: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { dietaryTags: { hasSome: [query] } },
          {
            provider: {
              providerProfile: {
                restaurantName: { contains: query, mode: "insensitive" },
              },
            },
          },
        ],
      },
      include: {
        provider: {
          include: {
            providerProfile: {
              select: { restaurantName: true },
            },
          },
        },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),

    prisma.meal.findMany({
      where: { isAvailable: true },
      select: { dietaryTags: true },
      take: 100,
    }),

    prisma.user.findMany({
      where: {
        role: "PROVIDER",
        providerProfile: {
          OR: [
            { restaurantName: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
      },
      include: {
        providerProfile: {
          select: { restaurantName: true, logoUrl: true },
        },
      },
      take: 3,
    }),

    prisma.category.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
      },
      select: { id: true, name: true },
      take: 3,
    }),
  ]);

  const tagSet = new Set<string>();
  allMealsForTags.forEach((meal) => {
    meal.dietaryTags?.forEach((tag) => {
      if (tag.toLowerCase().includes(searchLower)) {
        tagSet.add(tag);
      }
    });
  });

  return {
    meals: meals.map((m) => ({
      id: m.id,
      name: m.name,
      imageUrl: m.imageUrl ?? undefined,
      restaurantName: m.provider?.providerProfile?.restaurantName ?? undefined,
      price: Number(m.price),
    })),
    tags: Array.from(tagSet).slice(0, 8),
    restaurants: restaurants.map((r) => ({
      id: r.id,
      name: r.providerProfile?.restaurantName ?? "Unknown",
      logoUrl: r.providerProfile?.logoUrl ?? undefined,
    })),
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
    })),
  };
};

export const mealService = {
  createMela,
  getAllMeal,
  getMealById,
  updateMeal,
  deleteMeal,
  getSuggestions,
};