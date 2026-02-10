import { CategoryCreateInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";


const createCategory = async (data: CategoryCreateInput) => {
  const existing = await prisma.category.findUnique({
    where: { name: data.name },
  });

  if (existing) {
    throw new Error("Category with this name already exists");
  }

  return prisma.category.create({
    data,
  });
};

const getAllCategories = async () => {
  return prisma.category.findMany({
    include: {
      _count: {
        select: { meals: true },
      },
    },
    orderBy: { name: "asc" },
  });
};

const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      meals: {
        where: { isAvailable: true },
        include: {
          provider: {
            include: {
              providerProfile: {
                select: { restaurantName: true },
              },
            },
          },
        },
      },
    },
  });

  if (!category) throw new Error("Category not found");

  return category;
};

const updateCategory = async (id: string, data: CategoryCreateInput) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) throw new Error("Category not found");

  if (data.name && data.name !== category.name) {
    const existing = await prisma.category.findUnique({
      where: { name: data.name },
    });
    if (existing) throw new Error("Category name already exists");
  }

  return prisma.category.update({
    where: { id },
    data,
  });
};

const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { meals: true },
      },
    },
  });

  if (!category) throw new Error("Category not found");

  if (category._count.meals > 0) {
    throw new Error("Cannot delete category with existing meals");
  }

  return prisma.category.delete({
    where: { id },
  });
};

export const categoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};