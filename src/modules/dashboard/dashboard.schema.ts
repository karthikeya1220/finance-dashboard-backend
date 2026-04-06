import { z } from "zod";

/**
 * Validates dashboard summary query parameters
 * - startDate and endDate must be valid ISO strings
 * - endDate must not be before startDate
 */
export const dashboardSummarySchema = z.object({
  startDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(new Date(val).getTime()),
      "Invalid startDate format. Use ISO 8601 format."
    ),
  endDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(new Date(val).getTime()),
      "Invalid endDate format. Use ISO 8601 format."
    ),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  "endDate must not be before startDate"
);

/**
 * Validates category breakdown query parameters
 */
export const dashboardCategoryBreakdownSchema = dashboardSummarySchema;

/**
 * Validates monthly trends query parameters
 * - months must be between 1 and 24 (2 years max)
 * - defaults to 6 months
 */
export const dashboardMonthlyTrendsSchema = z.object({
  months: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 6))
    .refine(
      (val) => !isNaN(val) && val >= 1 && val <= 24,
      "months must be between 1 and 24"
    ),
});

/**
 * Validates recent activity query parameters
 * - limit must be between 1 and 100 (default 10)
 */
export const dashboardRecentActivitySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine(
      (val) => !isNaN(val) && val >= 1 && val <= 100,
      "limit must be between 1 and 100"
    ),
});

export type DashboardSummaryQuery = z.infer<typeof dashboardSummarySchema>;
export type DashboardCategoryBreakdownQuery = z.infer<typeof dashboardCategoryBreakdownSchema>;
export type DashboardMonthlyTrendsQuery = z.infer<typeof dashboardMonthlyTrendsSchema>;
export type DashboardRecentActivityQuery = z.infer<typeof dashboardRecentActivitySchema>;
