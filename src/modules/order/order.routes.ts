import { Router } from "express";
import auth, { UserRole } from "../../middleware/auth";
import { OrderController } from "./order.controller";

const router = Router();

router.post("/", auth(UserRole.CUSTOMER), OrderController.placeOrder);

router.post(
  "/stripe/checkout",
  auth(UserRole.CUSTOMER),
  OrderController.createStripeCheckoutSession,
);

router.post(
  "/stripe/verify/:sessionId",
  auth(UserRole.CUSTOMER),
  OrderController.verifyStripePayment,
);

router.get("/my", auth(UserRole.CUSTOMER), OrderController.getMyOrders);

router.get(
  "/provider",
  auth(UserRole.PROVIDER),
  OrderController.getProviderOrders,
);

router.get("/:id", auth(), OrderController.getOrderById);

router.patch(
  "/:id/status",
  auth(UserRole.PROVIDER),
  OrderController.updateStatus,
);

router.patch(
  "/:id/cancel",
  auth(UserRole.CUSTOMER),
  OrderController.cancelOrder,
);

export const orderRouter = router;
