import { Router } from "express";
import { CategoryController } from "./category.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = Router();

router.get(
    "/", 
    CategoryController.getAllCategories
);

router.get(
    "/:id", 
    CategoryController.getCategoryById
);

router.post(
    "/", 
    auth(UserRole.ADMIN), 
    CategoryController.createCategory
);
router.patch(
    "/:id", 
    auth(UserRole.ADMIN), 
    CategoryController.updateCategory
);
router.delete(
    "/:id", 
    auth(UserRole.ADMIN), 
    CategoryController.deleteCategory
);

export const categoryRoutes = router;