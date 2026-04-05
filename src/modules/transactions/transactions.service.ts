import { Role } from "@prisma/client";
import { prisma } from "../../config/database";
import {
  NotFoundError,
  ForbiddenError,
} from "../../utils/ApiError";
import {
  getPaginationParams,
  getSkipTake,
  buildPaginationMeta,
} from "../../utils/pagination";
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionQuery,
} from "./transactions.schema";

const TRANSACTION_INCLUDE = {
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

export class TransactionsService {
  /**
   * Build where clause for transaction queries
   * @param query - Transaction query parameters
   * @param includeDeleted - Whether to include deleted transactions
   * @returns Prisma where clause object
   */
  private buildWhereClause(query: TransactionQuery, includeDeleted: boolean) {
    const where: any = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) {
        where.date.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.date.lte = new Date(query.endDate);
      }
    }

    if (query.minAmount || query.maxAmount) {
      where.amount = {};
      if (query.minAmount) {
        where.amount.gte = parseFloat(query.minAmount);
      }
      if (query.maxAmount) {
        where.amount.lte = parseFloat(query.maxAmount);
      }
    }

    // Enhanced search: notes, category name, and amount
    if (query.search && query.search.trim()) {
      const searchTerm = query.search.trim();
      const searchNumber = parseFloat(searchTerm);
      const isValidNumber = !isNaN(searchNumber);

      // Build OR conditions for multi-field search
      const orConditions: any[] = [
        // Search in notes field (contains, case insensitive)
        {
          notes: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        // Search in category name (via relation)
        {
          category: {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
      ];

      // If search term is a valid number, also search by exact amount match
      if (isValidNumber) {
        orConditions.push({
          amount: searchNumber,
        });
      }

      where.OR = orConditions;
    }

    return where;
  }

  async findAll(query: TransactionQuery, userRole: Role) {
    const includeDeleted = query.includeDeleted === "true" && userRole === Role.ADMIN;
    const where = this.buildWhereClause(query, includeDeleted);

    const paginationParams = getPaginationParams(query);
    const { skip, take } = getSkipTake(paginationParams);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: TRANSACTION_INCLUDE,
        skip,
        take,
        orderBy: { date: "desc" },
      }),
      prisma.transaction.count({ where }),
    ]);

    const meta = buildPaginationMeta(total, paginationParams);

    return { transactions, meta };
  }

  async findById(id: string) {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: TRANSACTION_INCLUDE,
    });

    if (!transaction) {
      throw new NotFoundError("Transaction");
    }

    return transaction;
  }

  async create(data: CreateTransactionInput, userId: string) {
    const transaction = await prisma.transaction.create({
      data: {
        amount: data.amount,
        type: data.type,
        categoryId: data.categoryId,
        date: new Date(data.date),
        notes: data.notes,
        createdById: userId,
      },
      include: TRANSACTION_INCLUDE,
    });

    return transaction;
  }

  async update(
    id: string,
    data: UpdateTransactionInput,
    userId: string,
    userRole: Role
  ) {
    const transaction = await this.findById(id);

    if (userRole !== Role.ADMIN && transaction.createdById !== userId) {
      throw new ForbiddenError("Cannot modify another user's transaction");
    }

    const updateData: any = {};

    if (data.amount !== undefined) {
      updateData.amount = data.amount;
    }
    if (data.type !== undefined) {
      updateData.type = data.type;
    }
    if (data.categoryId !== undefined) {
      updateData.categoryId = data.categoryId;
    }
    if (data.date !== undefined) {
      updateData.date = new Date(data.date);
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: TRANSACTION_INCLUDE,
    });

    return updated;
  }

  async softDelete(id: string, userId: string, userRole: Role) {
    const transaction = await this.findById(id);

    if (userRole !== Role.ADMIN && transaction.createdById !== userId) {
      throw new ForbiddenError("Cannot delete another user's transaction");
    }

    const deleted = await prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: TRANSACTION_INCLUDE,
    });

    return deleted;
  }

  /**
   * Find all soft-deleted transactions (ADMIN only)
   * @param query - Transaction query parameters
   * @returns Deleted transactions with pagination metadata
   */
  async findDeleted(query: TransactionQuery) {
    const where: any = {
      deletedAt: { not: null }, // Get only deleted transactions
    };

    // Apply optional filters to deleted transactions
    if (query.type) {
      where.type = query.type;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) {
        where.date.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.date.lte = new Date(query.endDate);
      }
    }

    if (query.minAmount || query.maxAmount) {
      where.amount = {};
      if (query.minAmount) {
        where.amount.gte = parseFloat(query.minAmount);
      }
      if (query.maxAmount) {
        where.amount.lte = parseFloat(query.maxAmount);
      }
    }

    if (query.search) {
      where.notes = {
        contains: query.search,
        mode: "insensitive",
      };
    }

    const paginationParams = getPaginationParams(query);
    const { skip, take } = getSkipTake(paginationParams);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: TRANSACTION_INCLUDE,
        skip,
        take,
        orderBy: { deletedAt: "desc" },
      }),
      prisma.transaction.count({ where }),
    ]);

    const meta = buildPaginationMeta(total, paginationParams);

    return { transactions, meta };
  }
}
