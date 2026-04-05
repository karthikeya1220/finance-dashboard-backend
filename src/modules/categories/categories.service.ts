import { prisma } from "../../config/database";
import { NotFoundError, ConflictError, ForbiddenError } from "../../utils/ApiError";
import { CreateCategoryInput } from "./categories.schema";

/**
 * Service for category management
 */
export class CategoriesService {
  /**
   * Get all categories
   * @returns Array of all categories sorted by name
   */
  async findAll() {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return categories;
  }

  /**
   * Get category by ID
   * @param id - Category ID
   * @returns Category data
   * @throws NotFoundError if category doesn't exist
   */
  async findById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundError("Category");
    }

    return category;
  }

  /**
   * Create a new category
   * @param data - Category creation input
   * @returns Created category
   * @throws ConflictError if category name already exists
   */
  async create(data: CreateCategoryInput) {
    // Check for duplicate name
    const existingCategory = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existingCategory) {
      throw new ConflictError(`Category "${data.name}" already exists`);
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    return category;
  }

  /**
   * Delete a category
   * @param id - Category ID
   * @returns Deleted category
   * @throws NotFoundError if category doesn't exist
   * @throws ForbiddenError if category has transactions
   */
  async delete(id: string) {
    // Check if category exists
    await this.findById(id);

    // Check if category has any transactions
    const transactionCount = await prisma.transaction.count({
      where: { categoryId: id },
    });

    if (transactionCount > 0) {
      throw new ForbiddenError(
        `Cannot delete category with ${transactionCount} transaction(s)`
      );
    }

    const category = await prisma.category.delete({
      where: { id },
    });

    return category;
  }
}
