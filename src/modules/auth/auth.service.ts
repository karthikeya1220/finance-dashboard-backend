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

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
}

export class AuthService {
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

    const jwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(
      jwtPayload,
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as any
    );

    const refreshToken = jwt.sign(
      jwtPayload,
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as any
    );

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

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as any;

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.status === "INACTIVE") {
        throw new AuthenticationError("User not found or inactive");
      }

      const jwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = jwt.sign(
        jwtPayload,
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN } as any
      );

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
