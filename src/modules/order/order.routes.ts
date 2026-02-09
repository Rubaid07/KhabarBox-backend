import { Router } from "express";
import auth, { UserRole } from "../../middleware/auth";
import { OrderController } from "./order.controller";

const router = Router()

router.get(
    "/my", 
    auth(UserRole.CUSTOMER), 
    OrderController.getMyOrders
);

router.post(
    "/", 
    auth(UserRole.CUSTOMER), 
    OrderController.placeOrder
);

export const orderRouter = router