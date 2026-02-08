import { Request, Response } from "express"
import { cartService } from "./cart.service";

const addToCart = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

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
    const user = req.user!;

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

const updateQuantity = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    const { cartId } = req.params;
    const { quantity } = req.body;

    const result = await cartService.updateQuantity(cartId as string, user.id, quantity);

    res.status(200).json({
      success: true,
      message: "Quantity updated",
      data: result,
    });
  } catch (e: any) {
    res.status(400).json({
      success: false,
      message: e.message || "Failed to update",
    });
  }
};

const removeItem = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    const { cartId } = req.params;

    await cartService.removeItem(cartId as string, user.id);

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (e: any) {
    res.status(400).json({
      success: false,
      message: e.message || "Failed to remove",
    });
  }
};

const clearCart = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    await cartService.clearCart(user.id);

    res.status(200).json({
      success: true,
      message: "Cart cleared",
    });
  } catch (e: any) {
    res.status(500).json({
      success: false,
      message: e.message || "Failed to clear cart",
    });
  }
};

export const CartController = {
    addToCart,
    getMyCart,
    updateQuantity,
    removeItem,
    clearCart
}