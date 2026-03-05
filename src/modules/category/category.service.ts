import { CategoryCreateInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

interface GetAllCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
}

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

const getAllCategories = async (params: GetAllCategoriesParams = {}) => {
  const { page, limit, search } = params;
  
  // বিল্ড কোয়েরি
  const where: any = {};
  
  // সার্চ কন্ডিশন
  if (search) {
    where.name = {
      contains: search,
      mode: 'insensitive', // কেস-ইনসেনসিটিভ সার্চ
    };
  }
  
  // পেজিনেশন চেক
  if (page && limit) {
    const skip = (page - 1) * limit;
    
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          _count: {
            select: { meals: true },
          },
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.category.count({ where }),
    ]);
    
    return {
      data: categories,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  
  // পেজিনেশন ছাড়া সব ক্যাটাগরি
  return prisma.category.findMany({
    where,
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