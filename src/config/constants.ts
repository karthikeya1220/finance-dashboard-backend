import { Role } from "@prisma/client";

export const ROLE_HIERARCHY: Record<Role, number> = {
  VIEWER: 1,
  ANALYST: 2,
  ADMIN: 3,
};

export const DEFAULT_PAGE_SIZE = 20;

export const MAX_PAGE_SIZE = 100;
