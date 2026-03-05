import { prisma } from "../../lib/prisma";

interface UpdateUserData {
  name?: string;
  image?: string;
  phone?: string;
}

const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      providerProfile: true,
    },
  });

  if (!user) throw new Error("User not found");

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    phone: user.phone,
    role: user.role,

    restaurantName: user.providerProfile?.restaurantName,
    description: user.providerProfile?.description, 
    address: user.providerProfile?.address,
    logoUrl: user.providerProfile?.logoUrl,
    openingHours: user.providerProfile?.openingHours,
  };
};

const updateMyProfile = async (userId: string, data: UpdateUserData) => {
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.image !== undefined) updateData.image = data.image;
  if (data.phone !== undefined) updateData.phone = data.phone;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return updated;
};

const updateProviderProfile = async (
  userId: string,
  data: {
    restaurantName?: string;
    description?: string;
    address?: string;
    logoUrl?: string;
    openingHours?: string;
  },
) => {
  const updateData: any = {};
  if (data.restaurantName !== undefined) updateData.restaurantName = data.restaurantName;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
  if (data.openingHours !== undefined) updateData.openingHours = data.openingHours;

  const updated = await prisma.providerProfile.update({
    where: { userId },
    data: updateData,
  });

  return updated;
};

const initProviderProfile = async (data: {
  email: string;
  restaurantName: string;
  address: string;
}) => {
  const { email, restaurantName, address } = data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) throw new Error("User not found");

  return await prisma.providerProfile.upsert({
    where: { userId: user.id },
    update: {
      restaurantName,
      address,
    },
    create: {
      userId: user.id,
      restaurantName,
      address,
      description: "",
      openingHours: "",
    },
  });
};

export const userService = {
  getMyProfile,
  updateMyProfile,
  updateProviderProfile,
  initProviderProfile,
};