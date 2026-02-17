import { prisma } from "../../lib/prisma";

export interface SuggestionResult {
  meals: Array<{ id: string; name: string; imageUrl?: string | undefined }>;
  tags: string[];
}

const getSuggestions = async (query: string): Promise<SuggestionResult> => {
  if (!query || query.length < 2) {
    return { meals: [], tags: [] };
  }

  const searchLower = query.toLowerCase();

  const [meals, tagMeals] = await Promise.all([
    prisma.meal.findMany({
      where: {
        isAvailable: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),

    prisma.meal.findMany({
      where: {
        isAvailable: true,
        dietaryTags: { hasSome: [query] }, 
      },
      select: { dietaryTags: true },
      take: 20,
    }),
  ]);

  const tagSet = new Set<string>();
  
  [...tagMeals].forEach((meal) => {
    meal.dietaryTags.forEach((tag) => {
      if (tag.toLowerCase().includes(searchLower)) {
        tagSet.add(tag);
      }
    });
  });

  const allTags = await prisma.meal.findMany({
    where: { isAvailable: true },
    select: { dietaryTags: true },
  });

  allTags.forEach((meal) => {
    meal.dietaryTags.forEach((tag) => {
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
    })),
    tags: Array.from(tagSet).slice(0, 5),
  };
};

export const SuggestionService = {
  getSuggestions,
};