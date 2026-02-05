import { Meal } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { CreateMealInput } from "./meal.types";

const createMela = async (data: CreateMealInput) => {
    const result = await prisma.meal.create({
        data
    })
    return result
}

export const mealService = {
    createMela
}