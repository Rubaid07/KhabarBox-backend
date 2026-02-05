import { Request, Response } from "express";
import { mealService } from "./meal.service";

const createMeal = async (req: Request, res: Response) => {
    try{
        const result = await mealService.createMela(req.body)
        res.status(201).json(result)
    } catch(e){
        res.status(400).json({
            error: "Meal creation failed",
            details: e
        })
    }
};

export const MealController = {
  createMeal,
};
