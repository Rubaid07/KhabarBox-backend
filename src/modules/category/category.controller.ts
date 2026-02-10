import { Request, Response } from "express";
import { categoryService } from "./category.service";

const createCategory = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.createCategory(req.body);
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: result,
    });
  } catch (e: any) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

const getAllCategories = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.getAllCategories();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (e: any) {
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await categoryService.getCategoryById(id as string);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (e: any) {
    res.status(404).json({
      success: false,
      message: e.message,
    });
  }
};

const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await categoryService.updateCategory(id as string, req.body);
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: result,
    });
  } catch (e: any) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(id as string);
    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (e: any) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

export const CategoryController = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};