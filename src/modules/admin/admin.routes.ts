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
router.patch(
  "/users/:userId/suspend",
  auth(UserRole.ADMIN),
  AdminController.suspendUser
);
router.patch(
  "/users/:userId/activate",
  auth(UserRole.ADMIN),
  AdminController.activateUser
);

export const adminRoutes = router;
