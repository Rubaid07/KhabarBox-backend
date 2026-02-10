// providerDashboard.routes.ts
import { Router } from "express";
import auth, { UserRole } from "../../middleware/auth";
import { ProviderDashboardController } from "./providerDashboard.controller";

const router = Router();

// All provider only
router.get("/stats", auth(UserRole.PROVIDER), ProviderDashboardController.getStats);
router.get("/orders", auth(UserRole.PROVIDER), ProviderDashboardController.getRecentOrders);
router.get("/popular-meals", auth(UserRole.PROVIDER), ProviderDashboardController.getPopularMeals);
router.get("/weekly-chart", auth(UserRole.PROVIDER), ProviderDashboardController.getWeeklyChart);

export const providerDashboardRoutes = router;