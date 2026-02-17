import { prisma } from "../../lib/prisma";
import {
  CreateProviderProfileInput,
  UpdateProviderProfileInput,
} from "./providerProfile.types";

const createProfile = async (
  userId: string,
  data: CreateProviderProfileInput,
) => {
  // Check if already exists
  const existing = await prisma.providerProfile.findUnique({
    where: { userId },
  });

  if (existing) {
    throw new Error("Profile already exists. Use update instead.");
  }

  return prisma.providerProfile.create({
    data: {
      ...data,
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
        },
      },
    },
  });
};

const getMyProfile = async (userId: string) => {
  const profile = await prisma.providerProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
        },
      },
    },
  });

  if (!profile) {
    throw new Error("Profile not found. Please create one.");
  }

  return profile;
};

const updateProfile = async (
  userId: string,
  data: UpdateProviderProfileInput,
) => {
  const profile = await prisma.providerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error("Profile not found. Create one first.");
  }

  return prisma.providerProfile.update({
    where: { userId },
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
        },
      },
    },
  });
};

const getPublicProfile = async (userId: string) => {
  const profile = await prisma.providerProfile.findUnique({
    where: { userId },
    include: {
      user: {
        include: {
          meals: {
            include: {
              reviews: true,
            },
          },
          _count: {
            select: { meals: true },
          },
        },
      },
    },
  });

  if (!profile) throw new Error("Provider profile not found");
  const allReviews = profile.user.meals.flatMap((meal) => meal.reviews || []);
  const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
  const averageRating =
    allReviews.length > 0
      ? Number((totalRating / allReviews.length).toFixed(1))
      : 0;

  return {
    ...profile,
    averageRating,
    totalReviews: allReviews.length,
  };
};

const getAllProfiles = async () => {
  const profiles = await prisma.providerProfile.findMany({
    take: 8,
    include: {
      user: {
        select: {
          image: true,
          name: true,
          _count: {
            select: { meals: true },
          },
        },
      },
    },
  });

  const userIds = profiles.map(p => p.userId);
  
  const ratingsData = await prisma.review.groupBy({
    by: ['mealId'],
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
    where: {
      meal: {
        providerId: {
          in: userIds,
        },
      },
    },
  });

  const meals = await prisma.meal.findMany({
    where: {
      providerId: {
        in: userIds,
      },
    },
    select: {
      id: true,
      providerId: true,
    },
  });

  const providerStats = new Map();
  
  ratingsData.forEach((r) => {
    const meal = meals.find(m => m.id === r.mealId);
    if (meal) {
      const current = providerStats.get(meal.providerId) || { total: 0, count: 0, sum: 0 };
      current.count += r._count.rating;
      current.sum += (r._avg.rating || 0) * r._count.rating;
      providerStats.set(meal.providerId, current);
    }
  });

  return profiles.map((profile) => {
    const stats = providerStats.get(profile.userId);
    const averageRating = stats ? Number((stats.sum / stats.count).toFixed(1)) : 0;
    const totalReviews = stats ? stats.count : 0;

    return {
      id: profile.id,
      userId: profile.userId,
      restaurantName: profile.restaurantName,
      description: profile.description,
      address: profile.address,
      logoUrl: profile.logoUrl,
      isVerified: true,
      averageRating,
      totalReviews,
      user: {
        name: profile.user.name,
        image: profile.user.image,
        _count: profile.user._count,
      },
    };
  });
};

const getTopRatedRestaurants = async () => {
  const profiles = await prisma.providerProfile.findMany({
    include: {
      user: {
        include: {
          _count: {
            select: {
              meals: {
                where: { isAvailable: true },
              },
            },
          },
          meals: {
            include: {
              reviews: true,
            },
          },
        },
      },
    },
  });

  const result = profiles.map((profile) => {
    const allReviews =
      profile.user.meals?.flatMap((meal) => meal.reviews || []) || [];

    const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating =
      allReviews.length > 0
        ? Number((totalRating / allReviews.length).toFixed(1))
        : 0;

    return {
      id: profile.id,
      userId: profile.userId,
      restaurantName: profile.restaurantName,
      description: profile.description,
      address: profile.address,
      logoUrl: profile.logoUrl,
      averageRating,
      totalReviews: allReviews.length,
      user: {
        name: profile.user.name,
        image: profile.user.image,
        _count: profile.user._count,
      },
    };
  });
  return result.sort((a, b) => b.averageRating - a.averageRating).slice(0, 10);
};

export const providerProfileService = {
  createProfile,
  getMyProfile,
  updateProfile,
  getPublicProfile,
  getAllProfiles,
  getTopRatedRestaurants,
};
