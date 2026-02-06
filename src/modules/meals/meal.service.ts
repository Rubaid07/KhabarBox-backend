import { prisma } from "../../lib/prisma";
import { CreateMealInput } from "./meal.types";

const createMela = async (data: CreateMealInput, userId: string) => {
    const result = await prisma.meal.create({
        data: {
            ...data,
            providerId: userId
        }
    })
    return result
}

export const mealService = {
    createMela
}