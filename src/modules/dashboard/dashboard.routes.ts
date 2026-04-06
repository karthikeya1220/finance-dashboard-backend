import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getRecentActivity,
} from "./dashboard.controller";
import {
  dashboardSummarySchema,
  dashboardCategoryBreakdownSchema,
  dashboardMonthlyTrendsSchema,
  dashboardRecentActivitySchema,
} from "./dashboard.schema";

const router = Router();

// All dashboard routes require authentication (any role)
router.use(authMiddleware);

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Get financial summary
 *     description: Retrieve overall financial summary including total income, expenses, and balance. Non-admin users see only their own data.
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date (ISO 8601 format, defaults to first day of current month)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date (ISO 8601 format, defaults to today)
 *     responses:
 *       200:
 *         description: Summary retrieved successfully
 *       400:
 *         description: Invalid date parameters
 *       401:
 *         description: Unauthorized
 */
router.get("/summary", validate(dashboardSummarySchema, "query"), getSummary);

/**
 * @swagger
 * /dashboard/categories:
 *   get:
 *     summary: Get category breakdown
 *     description: Retrieve expense breakdown by category. Non-admin users see only their own data.
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Category breakdown retrieved successfully
 *       400:
 *         description: Invalid date parameters
 *       401:
 *         description: Unauthorized
 */
router.get("/categories", validate(dashboardCategoryBreakdownSchema, "query"), getCategoryBreakdown);

/**
 * @swagger
 * /dashboard/trends:
 *   get:
 *     summary: Get monthly trends
 *     description: Retrieve monthly income and expense trends. Non-admin users see only their own data. Maximum 24 months.
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 24
 *           default: 6
 *         description: Number of months to retrieve (defaults to 6, max 24)
 *     responses:
 *       200:
 *         description: Trends retrieved successfully
 *       400:
 *         description: Invalid months parameter
 *       401:
 *         description: Unauthorized
 */
router.get("/trends", validate(dashboardMonthlyTrendsSchema, "query"), getMonthlyTrends);

/**
 * @swagger
 * /dashboard/recent:
 *   get:
 *     summary: Get recent activity
 *     description: Retrieve recent transactions and activity. Non-admin users see only their own data. Maximum 100 records.
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of recent transactions to retrieve (defaults to 10, max 100)
 *     responses:
 *       200:
 *         description: Recent activity retrieved successfully
 *       400:
 *         description: Invalid limit parameter
 *       401:
 *         description: Unauthorized
 */
router.get("/recent", validate(dashboardRecentActivitySchema, "query"), getRecentActivity);

export default router;
