import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  login,
  refreshToken,
  getProfile,
} from "./auth.controller";
import { loginSchema, refreshTokenSchema } from "./auth.schema";

const router = Router();

router.post("/login", validate(loginSchema, "body"), login);
router.post("/refresh", validate(refreshTokenSchema, "body"), refreshToken);
router.get("/profile", authMiddleware, getProfile);

export default router;
