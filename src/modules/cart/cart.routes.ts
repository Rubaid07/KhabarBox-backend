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

router.patch(
    "/:cartId",
    auth(UserRole.CUSTOMER),
    CartController.updateQuantity
)

router.delete(
    "/:cartId", 
    auth(UserRole.CUSTOMER), 
    CartController.removeItem
);

router.delete(
    "/", 
    auth(UserRole.CUSTOMER), 
    CartController.clearCart
);

export const cartRouter = router