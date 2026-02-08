import { Request, Response } from "express";
import { reviewService } from "./review.service";

const createReview = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const result = await reviewService.createReview({
      ...req.body,
      customerId: user.id,
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: result,
    });
  } catch (e: any) {
    res.status(400).json({
      success: false,
      error: e.message || "Failed to add review",
    });
  }
};

export const ReviewController = {
    createReview,
}