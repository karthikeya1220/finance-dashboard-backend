import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { AppError, ConflictError, NotFoundError } from "../utils/ApiError";
import { env } from "../config/env";
import { ApiResponse } from "../utils/ApiResponse";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = "Internal server error";
  let errors: Array<{ field: string; message: string }> = [];

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      // Unique constraint violation
      const target = (err.meta?.target as string[]) || [];
      const fields = target.join(", ");
      statusCode = 409;
      message = `${fields} already exists`;
    } else if (err.code === "P2025") {
      // Record not found
      statusCode = 404;
      message = "Record not found";
    } else if (err.code === "P2003") {
      // Foreign key constraint violation
      statusCode = 400;
      message = "Invalid reference: related record not found";
    } else {
      statusCode = 400;
      message = "Database error";
    }
  }
  // Handle AppError
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }
  // Handle unknown errors
  else {
    if (env.NODE_ENV === "development") {
      console.error("❌ Unhandled Error:", err);
    } else {
      console.error("❌ Unhandled Error (Production):", err);
    }

    statusCode = 500;
    message =
      env.NODE_ENV === "development"
        ? (err as Error).message || "Internal server error"
        : "Internal server error";
  }

  const response = new ApiResponse(statusCode, message, null, null);

  const responseBody: any = {
    status: response.status,
    statusCode: response.statusCode,
    message: response.message,
  };

  if (errors.length > 0) {
    responseBody.errors = errors;
  }

  if (env.NODE_ENV === "development" && !(err instanceof AppError)) {
    responseBody.stack = (err as Error).stack;
  }

  res.status(statusCode).json(responseBody);
}
