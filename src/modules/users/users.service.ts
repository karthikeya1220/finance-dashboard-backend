import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from "../../utils/ApiError";
import {
  getPaginationParams,
  getSkipTake,
  buildPaginationMeta,
} from "../../utils/pagination";
import { CreateUserInput, UpdateUserInput, UserQuery } from "./users.schema";

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

export class UsersService {
  async findAll(query: UserQuery) {
    const paginationParams = getPaginationParams(query);
    const { skip, take } = getSkipTake(paginationParams);

    const where: any = {};

    if (query.role) {
      where.role = query.role;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: USER_SELECT,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    const meta = buildPaginationMeta(total, paginationParams);

    return { users, meta };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    return user;
  }

  async create(data: CreateUserInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError("Email already in use");
    }

    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        role: data.role,
      },
      select: USER_SELECT,
    });

    return user;
  }

  async update(
    id: string,
    data: UpdateUserInput,
    requesterId: string,
    requesterRole: Role
  ) {
    await this.findById(id);

    if (requesterId === id && data.role && data.role !== requesterRole) {
      throw new ForbiddenError("Cannot change your own role");
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        status: data.status,
      },
      select: USER_SELECT,
    });

    return user;
  }

  async delete(id: string, requesterId: string) {
    if (id === requesterId) {
      throw new ForbiddenError("Cannot delete your own account");
    }

    await this.findById(id);

    const user = await prisma.user.delete({
      where: { id },
      select: USER_SELECT,
    });

    return user;
  }
}
