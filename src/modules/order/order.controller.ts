import { Request, Response } from "express";
import { orderService } from "./order.service";

const placeOrder = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    
    const { deliveryAddress } = req.body;

    const result = await orderService.placeOrder(user.id, {
      deliveryAddress,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: result,
    });
  } catch (e: any) {
    res.status(400).json({
      success: false,
      message: e.message || "Failed to place order",
    });
  }
};

const getMyOrders = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const result = await orderService.getMyOrders(user.id);

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

const getProviderOrders = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    const result = await orderService.getProviderOrders(user.id);

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

const getOrderById = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const result = await orderService.getOrderById(id as string, user.id, user.role);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (e: any) {
    res.status(403).json({
      success: false,
      message: e.message,
    });
  }
};

export const OrderController = {
    placeOrder,
    getMyOrders,
    getProviderOrders,
    getOrderById
}