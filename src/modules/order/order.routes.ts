import { Router } from "express";
import auth, { UserRole } from "../../middleware/auth";
import { OrderController } from "./order.controller";

const router = Router()

router.get(
    "/:id", 
    auth(),
    OrderController.getOrderById
);

router.get(
    "/my", 
    auth(UserRole.CUSTOMER), 
    OrderController.getMyOrders
);

router.get(
    "/provider", 
    auth(UserRole.PROVIDER), 
    OrderController.getProviderOrders
);

router.patch(
    "/:id/status", 
    auth(UserRole.PROVIDER), 
    OrderController.updateStatus
);

router.post(
    "/", 
    auth(UserRole.CUSTOMER), 
    OrderController.placeOrder
);



export const orderRouter = router