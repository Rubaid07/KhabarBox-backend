import { Router } from "express";
import auth, { UserRole } from "../../middleware/auth";
import { ReviewController } from "./review.controller";

const router = Router();

router.get(
    "/meals/:mealId",
    ReviewController.getReviews
)

router.get(
    "/my",
    ReviewController.getMyReviews
)

router.post(
    "/", 
    auth(UserRole.CUSTOMER),
    ReviewController.createReview
)

router.patch(
    "/:reviewId", 
    auth(UserRole.CUSTOMER),
    ReviewController.updateReview
)

export const reviewRouter = router