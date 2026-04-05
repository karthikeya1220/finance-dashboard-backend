import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getRecentActivity,
} from "./dashboard.controller";

const router = Router();

// All dashboard routes require authentication (any role)
router.use(authMiddleware);

router.get("/summary", getSummary);
router.get("/categories", getCategoryBreakdown);
router.get("/trends", getMonthlyTrends);
router.get("/recent", getRecentActivity);

export default router;
