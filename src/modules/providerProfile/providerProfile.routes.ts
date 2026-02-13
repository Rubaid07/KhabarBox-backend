import { Router } from "express";
import auth, { UserRole } from "../../middleware/auth";
import { ProviderProfileController } from "./providerProfile.controller";

const router = Router();

router.get(
    "/top-rated", 
    ProviderProfileController.getTopRatedRestaurants
);

router.get(
    "/", 
    ProviderProfileController.getAllProfiles
);

router.get(
    "/:userId",
    ProviderProfileController.getPublicProfile
);

router.get(
    "/me", 
    auth(UserRole.PROVIDER), 
    ProviderProfileController.getMyProfile
);

router.post(
    "/", 
    auth(UserRole.PROVIDER), 
    ProviderProfileController.createProfile
)

router.patch(
    "/me", 
    auth(UserRole.PROVIDER), 
    ProviderProfileController.updateProfile
);

export const providerProfileRoutes = router;