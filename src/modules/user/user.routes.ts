import { Router } from "express";
import auth from "../../middleware/auth";
import { UserController } from "./user.controller";

const router = Router();

router.get(
    "/me", 
    auth(), 
    UserController.getProfile
);
router.put(
    "/me", 
    auth(), 
    UserController.updateProfile
);

export const userRouter = router;