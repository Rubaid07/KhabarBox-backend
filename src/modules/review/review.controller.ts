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

const getReviews = async (req: Request, res: Response) => {
  try {
    const { mealId } = req.params;
    const result = await reviewService.getReviews(mealId as string);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch reviews",
    });
  }
};

const getMyReviews = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const result = await reviewService.getMyReviews(user.id);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch reviews",
    });
  }
};

const updateReview = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const result = await reviewService.updateReview(reviewId as string, user.id, {
      rating,
      comment,
    });

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: result,
    });
  } catch (e: any) {
    res.status(403).json({
      success: false,
      message: e.message || "Failed to update review",
    });
  }
};

export const ReviewController = {
    createReview,
    getReviews,
    getMyReviews,
    updateReview
}