import { Response, NextFunction, RequestHandler } from "express";
import { Role } from "@prisma/client";
import { AuthenticatedRequest } from "../types/index";
import { ROLE_HIERARCHY } from "../config/constants";
import { ForbiddenError, AuthenticationError } from "../utils/ApiError";

/**
 * Create middleware to require one or more roles
 * @param roles - Role(s) that are allowed
 * @returns Middleware function that checks role permissions
 * @throws ForbiddenError if user doesn't have required role
 * @throws AuthenticationError if user is not authenticated
 */
export function requireRole(...roles: Role[]): RequestHandler {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError("Authentication required"));
    }

    const minRequiredLevel = Math.min(
      ...roles.map((role) => ROLE_HIERARCHY[role])
    );
    const userLevel = ROLE_HIERARCHY[req.user.role];

    if (userLevel < minRequiredLevel) {
      const requiredRoles = roles.join(" or ");
      return next(
        new ForbiddenError(`Requires role: ${requiredRoles}`)
      );
    }

    next();
  };
}

/**
 * Middleware to require ADMIN role
 */
export const requireAdmin = requireRole(Role.ADMIN);

/**
 * Middleware to require ANALYST or higher role
 */
export const requireAnalyst = requireRole(Role.ANALYST);

/**
 * Middleware to require VIEWER or higher role
 */
export const requireViewer = requireRole(Role.VIEWER);
