import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import {
  AuthenticationError,
  NotFoundError,
} from "../../utils/ApiError";
import { LoginInput } from "./auth.schema";
import { AuthenticatedUser } from "../../types/index";

/**
 * JWT payload interface
 */
interface JWTPayload {
  sub: string;
  email: string;
  role: string;
}

/**
 * Login result interface
 */
export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
}

/**
 * Authentication service
 */
export class AuthService {
  /**
   * Authenticate user with email and password
   * @param data - Login input containing email and password
   * @returns LoginResult with access token, refresh token, and user info
   * @throws AuthenticationError if credentials are invalid
   */
  async login(data: LoginInput): Promise<LoginResult> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || user.status === "INACTIVE") {
      throw new AuthenticationError("Invalid credentials");
    }

    const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!passwordMatch) {
      throw new AuthenticationError("Invalid credentials");
    }

    const jwtPayload: JWTPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const signOptions = { expiresIn: env.JWT_EXPIRES_IN };
    const accessToken = jwt.sign(jwtPayload, env.JWT_SECRET, signOptions as any);

    const refreshSignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN };
    const refreshToken = jwt.sign(jwtPayload, env.JWT_REFRESH_SECRET, refreshSignOptions as any);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Refresh an expired access token using a valid refresh token
   * @param token - Refresh token
   * @returns Object with new access token
   * @throws AuthenticationError if refresh token is invalid or expired
   */
  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload;

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.status === "INACTIVE") {
        throw new AuthenticationError("User not found or inactive");
      }

      const jwtPayload: JWTPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const signOptions = { expiresIn: env.JWT_EXPIRES_IN };
      const accessToken = jwt.sign(jwtPayload, env.JWT_SECRET, signOptions as any);

      return { accessToken };
    } catch (error) {
      if (
        error instanceof jwt.JsonWebTokenError ||
        error instanceof jwt.TokenExpiredError
      ) {
        throw new AuthenticationError("Invalid or expired refresh token");
      }
      throw error;
    }
  }

  /**
   * Get user profile by ID
   * @param userId - User ID
   * @returns User profile data
   * @throws NotFoundError if user is not found
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return user;
  }
}
