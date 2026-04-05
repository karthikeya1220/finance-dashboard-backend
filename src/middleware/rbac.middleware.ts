import { Response, NextFunction, RequestHandler } from "express";
import { Role } from "@prisma/client";
import { AuthenticatedRequest } from "../types/index";
import { ROLE_HIERARCHY } from "../config/constants";
import { ForbiddenError, AuthenticationError } from "../utils/ApiError";

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

export const requireAdmin = requireRole(Role.ADMIN);
export const requireAnalyst = requireRole(Role.ANALYST);
export const requireViewer = requireRole(Role.VIEWER);
