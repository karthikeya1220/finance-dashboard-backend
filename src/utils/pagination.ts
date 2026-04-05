import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../config/constants";

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Pagination metadata for responses
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Extract and validate pagination parameters from query
 * @param query - Query object from request
 * @returns PaginationParams with validated page and limit
 */
export function getPaginationParams(query: any): PaginationParams {
  let page = parseInt(query.page, 10) || 1;
  let limit = parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE;

  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > MAX_PAGE_SIZE) limit = MAX_PAGE_SIZE;

  return { page, limit };
}

/**
 * Build pagination metadata from total count and params
 * @param total - Total number of records
 * @param params - Pagination parameters
 * @returns PaginationMeta with page info and navigation flags
 */
export function buildPaginationMeta(
  total: number,
  params: PaginationParams
): PaginationMeta {
  const totalPages = Math.ceil(total / params.limit);
  const hasNextPage = params.page < totalPages;
  const hasPreviousPage = params.page > 1;

  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
}

/**
 * Calculate skip and take values for database queries
 * @param params - Pagination parameters
 * @returns Object with skip and take values
 */
export function getSkipTake(params: PaginationParams): {
  skip: number;
  take: number;
} {
  const skip = (params.page - 1) * params.limit;
  const take = params.limit;

  return { skip, take };
}
