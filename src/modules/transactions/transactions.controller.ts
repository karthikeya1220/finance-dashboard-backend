import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types/index";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { TransactionsService } from "./transactions.service";
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionQuery,
} from "./transactions.schema";

const transactionsService = new TransactionsService();

export const getAllTransactions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const result = await transactionsService.findAll(
      req.query as TransactionQuery,
      req.user!.role
    );
    const response = new ApiResponse(
      200,
      "Transactions retrieved",
      result.transactions,
      result.meta
    );
    res.status(response.statusCode).json(response);
  }
);

export const getTransactionById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const transaction = await transactionsService.findById(req.params.id as string);
    const response = new ApiResponse(200, "Transaction retrieved", transaction);
    res.status(response.statusCode).json(response);
  }
);

export const createTransaction = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const transaction = await transactionsService.create(
      req.body as CreateTransactionInput,
      req.user!.id
    );
    const response = new ApiResponse(201, "Transaction created", transaction);
    res.status(response.statusCode).json(response);
  }
);

export const updateTransaction = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const transaction = await transactionsService.update(
      req.params.id as string,
      req.body as UpdateTransactionInput,
      req.user!.id,
      req.user!.role
    );
    const response = new ApiResponse(200, "Transaction updated", transaction);
    res.status(response.statusCode).json(response);
  }
);

export const getDeletedTransactions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const result = await transactionsService.findDeleted(
      req.query as TransactionQuery
    );
    const response = new ApiResponse(
      200,
      "Deleted transactions retrieved",
      result.transactions,
      result.meta
    );
    res.status(response.statusCode).json(response);
  }
);

export const deleteTransaction = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    await transactionsService.softDelete(
      req.params.id as string,
      req.user!.id,
      req.user!.role
    );
    const response = new ApiResponse(200, "Transaction deleted", null);
    res.status(response.statusCode).json(response);
  }
);
