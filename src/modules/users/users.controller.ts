import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types/index";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { UsersService } from "./users.service";
import {
  CreateUserInput,
  UpdateUserInput,
  UserQuery,
} from "./users.schema";

const usersService = new UsersService();

export const getAllUsers = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const result = await usersService.findAll(req.query as UserQuery);
    const response = new ApiResponse(
      200,
      "Users retrieved",
      result.users,
      result.meta
    );
    res.status(response.statusCode).json(response);
  }
);

export const getUserById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const user = await usersService.findById(req.params.id as string);
    const response = new ApiResponse(200, "User retrieved", user);
    res.status(response.statusCode).json(response);
  }
);

export const createUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const user = await usersService.create(req.body as CreateUserInput);
    const response = new ApiResponse(201, "User created", user);
    res.status(response.statusCode).json(response);
  }
);

export const updateUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const user = await usersService.update(
      req.params.id as string,
      req.body as UpdateUserInput,
      req.user!.id,
      req.user!.role
    );
    const response = new ApiResponse(200, "User updated", user);
    res.status(response.statusCode).json(response);
  }
);

export const deleteUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    await usersService.delete(req.params.id as string, req.user!.id);
    const response = new ApiResponse(200, "User deleted", null);
    res.status(response.statusCode).json(response);
  }
);
