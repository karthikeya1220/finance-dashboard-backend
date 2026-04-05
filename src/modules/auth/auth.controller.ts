import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types/index";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { AuthService, LoginResult } from "./auth.service";
import { LoginInput, RefreshTokenInput } from "./auth.schema";

const authService = new AuthService();

export const login = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const result: LoginResult = await authService.login(req.body as LoginInput);
    const response = new ApiResponse(200, "Login successful", result);
    res.status(response.statusCode).json(response);
  }
);

export const refreshToken = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const result = await authService.refreshToken(
      (req.body as RefreshTokenInput).refreshToken
    );
    const response = new ApiResponse(200, "Token refreshed", result);
    res.status(response.statusCode).json(response);
  }
);

export const getProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const profile = await authService.getProfile(req.user!.id);
    const response = new ApiResponse(200, "Profile retrieved", profile);
    res.status(response.statusCode).json(response);
  }
);
