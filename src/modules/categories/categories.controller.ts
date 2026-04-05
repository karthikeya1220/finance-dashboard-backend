import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types/index";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { CategoriesService } from "./categories.service";
import { CreateCategoryInput } from "./categories.schema";

const categoriesService = new CategoriesService();

/**
 * Get all categories
 * @param req - Express request
 * @param res - Express response
 * @param _next - Express next function
 * @returns List of all categories
 */
export const getAllCategories = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const categories = await categoriesService.findAll();
    const response = new ApiResponse(200, "Categories retrieved", categories);
    res.status(response.statusCode).json(response);
  }
);

/**
 * Create a new category (ADMIN only)
 * @param req - Express request with category data
 * @param res - Express response
 * @param _next - Express next function
 * @returns Created category (201)
 */
export const createCategory = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const category = await categoriesService.create(req.body as CreateCategoryInput);
    const response = new ApiResponse(201, "Category created", category);
    res.status(response.statusCode).json(response);
  }
);

/**
 * Delete a category (ADMIN only)
 * @param req - Express request with category ID
 * @param res - Express response
 * @param _next - Express next function
 * @returns Empty response (200)
 * @throws ForbiddenError if category has transactions
 */
export const deleteCategory = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    await categoriesService.delete(req.params.id as string);
    const response = new ApiResponse(200, "Category deleted", null);
    res.status(response.statusCode).json(response);
  }
);
