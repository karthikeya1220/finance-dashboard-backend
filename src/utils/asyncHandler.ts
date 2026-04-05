import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps async route handlers and catches any errors to pass to error middleware
 * @param fn - Async handler function
 * @returns RequestHandler that catches errors
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
