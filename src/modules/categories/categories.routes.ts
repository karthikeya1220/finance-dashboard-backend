import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireAdmin } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  getAllCategories,
  createCategory,
  deleteCategory,
} from "./categories.controller";
import { createCategorySchema } from "./categories.schema";

const router = Router();

/**
 * Public route - list all categories
 */
router.get("/", getAllCategories);

/**
 * Protected routes - require authentication and ADMIN role
 */
router.use(authMiddleware);
router.use(requireAdmin);

/**
 * Create a new category (ADMIN only)
 */
router.post("/", validate(createCategorySchema, "body"), createCategory);

/**
 * Delete a category (ADMIN only)
 */
router.delete("/:id", deleteCategory);

export default router;
