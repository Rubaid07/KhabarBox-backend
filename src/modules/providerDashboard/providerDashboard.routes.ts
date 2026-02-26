import { Router } from "express";
import auth, { UserRole } from "../../middleware/auth";
import { ProviderDashboardController } from "./providerDashboard.controller";

const router = Router();

router.get(
    "/stats", 
    auth(UserRole.PROVIDER, UserRole.ADMIN),
    ProviderDashboardController.getStats
);

router.get(
    "/orders", 
    auth(UserRole.PROVIDER, UserRole.ADMIN),
    ProviderDashboardController.getRecentOrders
);

router.get(
    "/popular-meals", 
    auth(UserRole.PROVIDER, UserRole.ADMIN),
    ProviderDashboardController.getPopularMeals
);

router.get(
    "/weekly-chart", 
    auth(UserRole.PROVIDER, UserRole.ADMIN),
    ProviderDashboardController.getWeeklyChart
);

router.get(
    "/meals", 
    auth(UserRole.PROVIDER, UserRole.ADMIN),
    ProviderDashboardController.getMyMeals
);

export const providerDashboardRoutes = router;