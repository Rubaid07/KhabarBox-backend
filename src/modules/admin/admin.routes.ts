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
router.delete(
  "/users/:userId", 
  auth(UserRole.ADMIN), 
  AdminController.deleteUser
);
router.patch(
  "/orders/:orderId/status", 
  auth(UserRole.ADMIN), 
  AdminController.updateOrderStatus
);
router.patch(
  "/orders/:orderId/cancel", 
  auth(UserRole.ADMIN), 
  AdminController.cancelOrder
);

export const adminRoutes = router;
