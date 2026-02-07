import express from "express";
import { MealController } from "./meal.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = express.Router();

router.get(
   "/",
   MealController.getAllMeal
)

router.post(
   "/", 
   auth(UserRole.PROVIDER), 
   MealController.createMeal
);

export const mealRouter = router; 