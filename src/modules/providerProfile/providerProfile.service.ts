import { prisma } from "../../lib/prisma";
import { CreateProviderProfileInput } from "./providerProfile.types";

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

export const providerProfileService = {
  createProfile,
};