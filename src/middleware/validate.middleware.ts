import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodSchema } from "zod";
import { ValidationError, ErrorDetail } from "../utils/ApiError";

/**
 * Create middleware to validate request data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param target - Part of request to validate (body, query, or params)
 * @returns Middleware function that validates and passes to next
 * @throws ValidationError if validation fails
 */
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

