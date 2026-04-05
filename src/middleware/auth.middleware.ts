import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/index";
import { prisma } from "../config/database";
import { env } from "../config/env";
import { AuthenticationError } from "../utils/ApiError";

/**
 * Middleware to verify JWT token and attach user to request
 * @param req - Express request with authorization header
 * @param _res - Express response
 * @param next - Express next function
 * @throws AuthenticationError if token is missing, invalid, or user is inactive
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError("Bearer token required");
    }

    const token = authHeader.slice(7);

    let payload: any;
    try {
      payload = jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
      if (
        error instanceof jwt.JsonWebTokenError ||
        error instanceof jwt.TokenExpiredError
      ) {
        throw new AuthenticationError("Invalid or expired token");
      }
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.status === "INACTIVE") {
      throw new AuthenticationError("User not found or inactive");
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}
