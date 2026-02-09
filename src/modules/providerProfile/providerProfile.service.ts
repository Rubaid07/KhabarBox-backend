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

export const providerProfileService = {
  createProfile,
  getMyProfile,
  updateProfile
};