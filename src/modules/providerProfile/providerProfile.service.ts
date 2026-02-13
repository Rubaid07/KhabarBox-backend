import { prisma } from "../../lib/prisma";
import { CreateProviderProfileInput, UpdateProviderProfileInput } from "./providerProfile.types";

const createProfile = async (
  userId: string,
  data: CreateProviderProfileInput
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
  data: UpdateProviderProfileInput
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
        select: {
          name: true,
          image: true,
          email: true,
          meals: {
            where: { isAvailable: true },
            include: {
              category: true,
            }
          },
          reviews: true
        },
      },
    },
  });

  if (!profile) throw new Error("Provider profile not found");
  return profile;
};

const getAllProfiles = async () => {
  return prisma.providerProfile.findMany({
    take: 8,
    select: {
      id: true,
      userId: true,
      restaurantName: true,
      description: true,
      address: true,
      logoUrl: true,
      user: {
        select: { 
          image: true, 
          name: true, 
          _count: {
            select: {meals: true}
          }
        }
      }
    }
  });
};

const getTopRatedRestaurants = async () => {
  const profiles = await prisma.providerProfile.findMany({
    where: { isVerified: true },
    include: {
      user: {
        select: {
          name: true,
          image: true,
          _count: {
            select: { meals: true }
          },
          meals: {
            select: {
              reviews: {
                select: {
                  rating: true
                }
              }
            }
          }
        }
      }
    }
  });
  const formattedProfiles = profiles.map(profile => {
    const allReviews = profile.user.meals.flatMap(meal => meal.reviews);
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : "0.0";

    return {
      ...profile,
      averageRating: parseFloat(averageRating),
      totalReviews: allReviews.length
    };
  });
  return formattedProfiles.sort((a, b) => b.averageRating - a.averageRating).slice(0, 6);
};

export const providerProfileService = {
  createProfile,
  getMyProfile,
  updateProfile,
  getPublicProfile,
  getAllProfiles,
  getTopRatedRestaurants
};