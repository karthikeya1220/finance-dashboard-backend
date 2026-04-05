import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types/index";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { DashboardService } from "./dashboard.service";

const dashboardService = new DashboardService();

export const getSummary = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const summary = await dashboardService.getSummary({
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    });
    const response = new ApiResponse(200, "Summary retrieved", summary);
    res.status(response.statusCode).json(response);
  }
);

export const getCategoryBreakdown = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const breakdown = await dashboardService.getCategoryBreakdown({
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    });
    const response = new ApiResponse(200, "Category breakdown retrieved", breakdown);
    res.status(response.statusCode).json(response);
  }
);

export const getMonthlyTrends = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const months = parseInt(req.query.months as string) || 6;
    const trends = await dashboardService.getMonthlyTrends(months);
    const response = new ApiResponse(200, "Monthly trends retrieved", trends);
    res.status(response.statusCode).json(response);
  }
);

export const getRecentActivity = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const activity = await dashboardService.getRecentActivity(limit);
    const response = new ApiResponse(200, "Recent activity retrieved", activity);
    res.status(response.statusCode).json(response);
  }
);
