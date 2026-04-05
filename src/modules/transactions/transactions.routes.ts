import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole, requireAdmin } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import { Role } from "@prisma/client";
import {
  getAllTransactions,
  getDeletedTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "./transactions.controller";
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
} from "./transactions.schema";

const router = Router();

const requireAnalyst = requireRole(Role.ANALYST, Role.ADMIN);

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: List all transactions
 *     description: Retrieve paginated list of transactions with optional filtering and searching
 *     tags:
 *       - Transactions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in notes, category name, or amount (numeric)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
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
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 pagination:
 *                   type: object
 */
router.get("/", validate(transactionQuerySchema, "query"), getAllTransactions);

/**
 * @swagger
 * /transactions/deleted:
 *   get:
 *     summary: List deleted transactions
 *     description: Retrieve soft-deleted transactions (ADMIN only)
 *     tags:
 *       - Transactions
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Deleted transactions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get("/deleted", requireAdmin, getDeletedTransactions);

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     description: Retrieve a specific transaction by its ID
 *     tags:
 *       - Transactions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 */
router.get("/:id", getTransactionById);

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new transaction
 *     description: Create a new transaction (ANALYST or ADMIN only)
 *     tags:
 *       - Transactions
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *               - categoryId
 *             properties:
 *               amount:
 *                 type: number
 *                 format: decimal
 *                 example: 50.00
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               notes:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Analyst/Admin access required
 */
router.post(
  "/",
  requireAnalyst,
  validate(createTransactionSchema, "body"),
  createTransaction
);

/**
 * @swagger
 * /transactions/{id}:
 *   patch:
 *     summary: Update a transaction
 *     description: Update an existing transaction (ANALYST or ADMIN only)
 *     tags:
 *       - Transactions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               notes:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Analyst/Admin access required
 */
router.patch(
  "/:id",
  requireAnalyst,
  validate(updateTransactionSchema, "body"),
  updateTransaction
);

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     description: Soft-delete a transaction (ANALYST or ADMIN only)
 *     tags:
 *       - Transactions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Analyst/Admin access required
 */
router.delete("/:id", requireAnalyst, deleteTransaction);

export default router;
