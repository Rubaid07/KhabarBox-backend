import { Router } from "express";
import auth, { UserRole } from "../../middleware/auth";
import { CartController } from "./cart.controller";

const router = Router();

router.get(
    "/",
    auth(UserRole.CUSTOMER),
    CartController.getMyCart
)

router.post(
    "/",
    auth(UserRole.CUSTOMER),
    CartController.addToCart
)

export const cartRouter = router