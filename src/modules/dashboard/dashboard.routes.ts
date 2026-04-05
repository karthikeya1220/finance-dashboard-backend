import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getRecentActivity,
} from "./dashboard.controller";

const router = Router();

// All dashboard routes require authentication (any role)
router.use(authMiddleware);

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Get financial summary
 *     description: Retrieve overall financial summary including total income, expenses, and balance
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Summary retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/summary", getSummary);

/**
 * @swagger
 * /dashboard/categories:
 *   get:
 *     summary: Get category breakdown
 *     description: Retrieve expense breakdown by category
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Category breakdown retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/categories", getCategoryBreakdown);

/**
 * @swagger
 * /dashboard/trends:
 *   get:
 *     summary: Get monthly trends
 *     description: Retrieve monthly income and expense trends
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Trends retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/trends", getMonthlyTrends);

/**
 * @swagger
 * /dashboard/recent:
 *   get:
 *     summary: Get recent activity
 *     description: Retrieve recent transactions and activity
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activity retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/recent", getRecentActivity);

export default router;
