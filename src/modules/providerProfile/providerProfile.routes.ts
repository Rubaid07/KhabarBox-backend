import { Router } from "express";
import auth, { UserRole } from "../../middleware/auth";
import { ProviderProfileController } from "./providerProfile.controller";

const router = Router();

router.post(
    "/", 
    auth(UserRole.PROVIDER), 
    ProviderProfileController.createProfile
)

export const providerProfileRoutes = router;