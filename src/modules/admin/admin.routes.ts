import { Router } from "express";
import auth, { UserRole } from "../../middleware/auth";
import { AdminController } from "./admin.controller";

const router = Router();

router.get(
    "/stats", 
    auth(UserRole.ADMIN), 
    AdminController.getDashboardStats
);
router.get(
    "/users", 
    auth(UserRole.ADMIN), 
    AdminController.getAllUsers
);
router.get(
    "/orders", 
    auth(UserRole.ADMIN), 
    AdminController.getAllOrders
);

export const adminRoutes = router;