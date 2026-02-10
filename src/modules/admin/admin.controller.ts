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

const suspendUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await adminService.suspendUser(userId as string);
    res.json({
      success: true,
      message: "User suspended",
      data: result,
    });
  } catch (e: any) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

const activateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await adminService.activateUser(userId as string);
    res.json({
      success: true,
      message: "User activated",
      data: result,
    });
  } catch (e: any) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    await adminService.deleteUser(userId as string);
    res.json({ 
      success: true, 
      message: "User deleted" 
    });
  } catch (e: any) {
    res.status(400).json({ 
      success: false, 
      message: e.message 
    });
  }
};

const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const result = await adminService.updateOrderStatus(orderId as string, status);
    res.json({ 
      success: true, 
      data: result 
    });
  } catch (e: any) {
    res.status(400).json({ 
      success: false, 
      message: e.message 
    });
  }
};

const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const result = await adminService.cancelOrder(orderId as string);
    res.json({ 
      success: true, 
      message: "Order cancelled", 
      data: result 
    });
  } catch (e: any) {
    res.status(400).json({ 
      success: false, 
      message: e.message
    });
  }
};

export const AdminController = {
  getDashboardStats,
  getAllUsers,
  getAllOrders,
  suspendUser,
  activateUser,
  deleteUser,
  updateOrderStatus,
  cancelOrder
};
