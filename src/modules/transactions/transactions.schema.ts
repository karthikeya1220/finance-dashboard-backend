import { z } from "zod";
import { TransactionType } from "@prisma/client";

export const createTransactionSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be positive")
    .multipleOf(0.01, "Amount can have maximum 2 decimal places"),
  type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]),
  categoryId: z.string().cuid("Category ID must be a valid CUID"),
  date: z
    .string()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"))
    .refine(
      (val) => {
        try {
          new Date(val);
          return true;
        } catch {
          return false;
        }
      },
      "Invalid date format"
    ),
  notes: z.string().max(500, "Notes must not exceed 500 characters").optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]).optional(),
  categoryId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.string().optional(),
  maxAmount: z.string().optional(),
  search: z.string().optional(),
  includeDeleted: z.enum(["true", "false"]).optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQuery = z.infer<typeof transactionQuerySchema>;
