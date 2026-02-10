import { Router } from "express";
import auth, { UserRole } from "../../middleware/auth";
import { ProviderDashboardController } from "./providerDashboard.controller";

const router = Router();

router.get(
    "/stats", 
    auth(UserRole.PROVIDER),
    ProviderDashboardController.getStats
);

router.get(
    "/orders", 
    auth(UserRole.PROVIDER),
    ProviderDashboardController.getRecentOrders
);

router.get(
    "/popular-meals", 
    auth(UserRole.PROVIDER),
    ProviderDashboardController.getPopularMeals
);

router.get(
    "/weekly-chart", 
    auth(UserRole.PROVIDER),
    ProviderDashboardController.getWeeklyChart
);

router.get(
    "/meals", 
    auth(UserRole.PROVIDER),
    ProviderDashboardController.getMyMeals
);

export const providerDashboardRoutes = router;