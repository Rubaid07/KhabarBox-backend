import express from "express";
import { MealController } from "./meal.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = express.Router();

router.get(
   "/",
   MealController.getAllMeal
)

router.get(
   "/:mealId",
   MealController.getMealById
)

router.post(
   "/", 
   auth(UserRole.PROVIDER), 
   MealController.createMeal
);

router.patch(
   "/:mealId", 
   auth(UserRole.PROVIDER), 
   MealController.updateMeal
);

router.delete(
   "/:mealId", 
   auth(UserRole.PROVIDER), 
   MealController.deleteMeal
);

export const mealRouter = router; 