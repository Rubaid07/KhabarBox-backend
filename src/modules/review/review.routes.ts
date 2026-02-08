import { Router } from "express";
import auth, { UserRole } from "../../middleware/auth";
import { ReviewController } from "./review.controller";

const router = Router();

router.post(
    "/", 
    auth(UserRole.CUSTOMER),
    ReviewController.createReview
)

export const reviewRouter = router