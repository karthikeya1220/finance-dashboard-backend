import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodSchema } from "zod";
import { ValidationError, ErrorDetail } from "../utils/ApiError";

export function validate(
  schema: ZodSchema,
  target: "body" | "query" | "params" = "body"
): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors: ErrorDetail[] = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return next(new ValidationError("Validation failed", errors));
    }

    // For immutable properties like query, params, we use Object.defineProperty
    if (target === "query" || target === "params") {
      Object.defineProperty(req, target, {
        value: result.data,
        writable: false,
        enumerable: true,
        configurable: true,
      });
    } else {
      req[target] = result.data;
    }
    next();
  };
}

