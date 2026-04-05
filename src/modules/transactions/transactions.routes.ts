import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import { Role } from "@prisma/client";
import {
  getAllTransactions,
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

// GET routes - accessible to all authenticated users
router.get("/", validate(transactionQuerySchema, "query"), getAllTransactions);
router.get("/:id", getTransactionById);

// POST route - requires analyst or admin
router.post(
  "/",
  requireAnalyst,
  validate(createTransactionSchema, "body"),
  createTransaction
);

// PATCH route - requires analyst or admin
router.patch(
  "/:id",
  requireAnalyst,
  validate(updateTransactionSchema, "body"),
  updateTransaction
);

// DELETE route - requires analyst or admin (ownership checked in service)
router.delete("/:id", requireAnalyst, deleteTransaction);

export default router;
