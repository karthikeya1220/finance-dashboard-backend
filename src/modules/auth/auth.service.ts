import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
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

    // Generate and hash refresh token
    const refreshTokenString = crypto.randomBytes(32).toString("hex");
    const hashedRefreshToken = await bcrypt.hash(refreshTokenString, env.BCRYPT_ROUNDS);
    
    // Calculate expiry time for refresh session
    const refreshTokenExpiryMs = parseInt(env.JWT_REFRESH_EXPIRES_IN.replace(/\D/g, "")) * 
                                  (env.JWT_REFRESH_EXPIRES_IN.includes("d") ? 86400000 : 
                                   env.JWT_REFRESH_EXPIRES_IN.includes("h") ? 3600000 : 60000);
    const expiresAt = new Date(Date.now() + refreshTokenExpiryMs);

    // Store hashed refresh token in database
    await prisma.refreshSession.create({
      data: {
        userId: user.id,
        hashedToken: hashedRefreshToken,
        expiresAt,
        deviceInfo: data.deviceInfo,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenString,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Refresh an expired access token using a valid refresh token with rotation
   * @param token - Refresh token (plain text)
   * @returns Object with new access token and rotated refresh token
   * @throws AuthenticationError if refresh token is invalid, expired, or revoked
   */
  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Find valid, non-revoked refresh session
      const now = new Date();
      const sessions = await prisma.refreshSession.findMany({
        where: {
          expiresAt: { gt: now },
          isRevoked: false,
        },
        include: { user: true },
        take: 100, // Limit search to prevent performance issues
      });

      let validSession = null;
      for (const session of sessions) {
        const tokenMatch = await bcrypt.compare(token, session.hashedToken);
        if (tokenMatch) {
          validSession = session;
          break;
        }
      }

      if (!validSession || validSession.user.status === "INACTIVE") {
        throw new AuthenticationError("Invalid or expired refresh token");
      }

      const user = validSession.user;

      // Revoke old session to prevent reuse (token rotation)
      await prisma.refreshSession.update({
        where: { id: validSession.id },
        data: { isRevoked: true },
      });

      // Generate new refresh token and session
      const newRefreshTokenString = crypto.randomBytes(32).toString("hex");
      const hashedNewRefreshToken = await bcrypt.hash(newRefreshTokenString, env.BCRYPT_ROUNDS);
      
      const refreshTokenExpiryMs = parseInt(env.JWT_REFRESH_EXPIRES_IN.replace(/\D/g, "")) * 
                                    (env.JWT_REFRESH_EXPIRES_IN.includes("d") ? 86400000 : 
                                     env.JWT_REFRESH_EXPIRES_IN.includes("h") ? 3600000 : 60000);
      const expiresAt = new Date(Date.now() + refreshTokenExpiryMs);

      await prisma.refreshSession.create({
        data: {
          userId: user.id,
          hashedToken: hashedNewRefreshToken,
          expiresAt,
          deviceInfo: validSession.deviceInfo,
        },
      });

      const jwtPayload: JWTPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const signOptions = { expiresIn: env.JWT_EXPIRES_IN };
      const accessToken = jwt.sign(jwtPayload, env.JWT_SECRET, signOptions as any);

      return { accessToken, refreshToken: newRefreshTokenString };
    } catch (error) {
      if (
        error instanceof jwt.JsonWebTokenError ||
        error instanceof jwt.TokenExpiredError
      ) {
        throw new AuthenticationError("Invalid or expired refresh token");
      }
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError("Token refresh failed");
    }
  }

  /**
   * Logout: revoke all refresh sessions for a user
   * @param userId - User ID
   */
  async logout(userId: string): Promise<void> {
    await prisma.refreshSession.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  /**
   * Logout from all devices: revoke all active refresh sessions
   * @param userId - User ID
   */
  async logoutAllDevices(userId: string): Promise<void> {
    await prisma.refreshSession.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
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
