import { z } from "zod";

/**
 * Schema for creating a new category
 */
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .min(3, "Category name must be at least 3 characters")
    .max(50, "Category name must not exceed 50 characters")
    .trim(),
  description: z
    .string()
    .max(255, "Description must not exceed 255 characters")
    .trim()
    .optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

/**
 * Schema for category ID parameter
 */
export const categoryIdSchema = z.object({
  id: z.string().cuid("Invalid category ID"),
});

export type CategoryIdInput = z.infer<typeof categoryIdSchema>;
