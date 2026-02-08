import { Request, Response } from "express"
import { cartService } from "./cart.service";
import { UserRole } from "../../middleware/auth";

const addToCart = async (req: Request, res: Response) => {
    try {
    const user = req.user;
    if (!user || user.role !== UserRole.CUSTOMER) {
      return res.status(403).json({ success: false, message: "Customer only" });
    }

    const result = await cartService.addToCart(user.id, req.body);

    res.status(201).json({
      success: true,
      message: "Added to cart",
      data: result,
    });
  } catch (e: any) {
    res.status(400).json({
      success: false,
      message: e.message || "Failed to add to cart",
    });
  }
};

const getMyCart = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== UserRole.CUSTOMER) {
      return res.status(403).json({ success: false, message: "Customer only" });
    }

    const result = await cartService.getMyCart(user.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (e: any) {
    res.status(500).json({
      success: false,
      message: e.message || "Failed to fetch cart",
    });
  }
};

export const CartController = {
    addToCart,
    getMyCart
}