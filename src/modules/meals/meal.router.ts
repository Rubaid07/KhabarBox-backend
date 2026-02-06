import express from "express";
import { MealController } from "./meal.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = express.Router();

router.post("/", 
   auth(UserRole.PROVIDER), 
   MealController.createMeal
);

export const mealRouter = router; 