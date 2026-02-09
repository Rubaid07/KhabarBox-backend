import { Request, Response } from "express";
import { adminService } from "./admin.service";

const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (e: any) {
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await adminService.getAllUsers(req.query);
    res.json({
      success: true,
      ...result,
    });
  } catch (e: any) {
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

const getAllOrders = async (req: Request, res: Response) => {
  try {
    const result = await adminService.getAllOrders(req.query);
    res.json({
      success: true,
      ...result,
    });
  } catch (e: any) {
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

export const AdminController = {
  getDashboardStats,
  getAllUsers,
  getAllOrders,
};
