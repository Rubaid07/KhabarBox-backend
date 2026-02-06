import { Request, Response } from "express";
import { mealService } from "./meal.service";

const createMeal = async (req: Request, res: Response) => {
  const user = req.user;
  try {
    if (!user) {
      return res.status(400).json({
        error: "Unauthorized!",
      });
    }
    const result = await mealService.createMela(req.body, user.id);
    res.status(201).json(result);
  } catch (e) {
    res.status(400).json({
      error: "Meal creation failed",
      details: e,
    });
  }
};

const getAllMeal = async (req: Request, res: Response) => {
  try {
    const { search, minPrice, maxPrice } = req.query;

    const searchString = typeof search === "string" ? search : undefined;

    const dietaryTags = req.query.dietaryTags
      ? (req.query.dietaryTags as string).split(",")
      : [];

    const isAvailable =
      req.query.isAvailable === "true"
        ? true
        : req.query.isAvailable === "false"
          ? false
          : undefined;

    const priceRange =
      typeof minPrice === "string" || typeof maxPrice === "string"
        ? {
            ...(typeof minPrice === "string" && { min: Number(minPrice) }),
            ...(typeof maxPrice === "string" && { max: Number(maxPrice) }),
          }
        : undefined;

    const filters = {
      ...(searchString && { search: searchString }),
      ...(dietaryTags.length > 0 && { dietaryTags }),
      ...(typeof isAvailable === "boolean" && { isAvailable }),
      ...(priceRange && { priceRange }),
    };

    const result = await mealService.getAllMeal(filters);

    // const result = await mealService.getAllMeal({
    //   search: searchString,
    //   dietaryTags,
    //   isAvailable,
    //   priceRange,
    // });

    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({
      error: "Fetching meals failed",
      details: e,
    });
  }
};

export const MealController = {
  createMeal,
  getAllMeal,
};
