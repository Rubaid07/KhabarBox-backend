import { Request, Response } from "express";
import { mealService } from "./meal.service";

const createMeal = async (req: Request, res: Response) => {
    const user = req.user
    try{
        if(!user){
            return res.status(400).json({
            error: "Unauthorized!"
        })
        }
        const result = await mealService.createMela(req.body, user.id)
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
