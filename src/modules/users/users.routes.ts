import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireAdmin } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "./users.controller";
import {
  createUserSchema,
  updateUserSchema,
  userQuerySchema,
} from "./users.schema";

const router = Router();

router.use(authMiddleware);
router.use(requireAdmin);

router.get("/", validate(userQuerySchema, "query"), getAllUsers);
router.get("/:id", getUserById);
router.post("/", validate(createUserSchema, "body"), createUser);
router.patch("/:id", validate(updateUserSchema, "body"), updateUser);
router.delete("/:id", deleteUser);

export default router;
