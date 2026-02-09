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

export const OrderController = {
    placeOrder
}