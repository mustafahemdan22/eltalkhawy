import { v } from 'convex/values';

/**
 * Standard pagination argument validators to be reused across Convex queries.
 */
export const paginationArgs = {
  page: v.optional(v.number()),
  limit: v.optional(v.number()),
  cursor: v.optional(v.union(v.string(), v.null())),
};

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  continueCursor?: string | null;
  isDone?: boolean;
}

function toPositiveInteger(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value) || value === undefined || value < 1) {
    return fallback;
  }

  return Math.floor(value);
}

/**
 * Helper to paginate an array of items (useful when combined with complex custom filtering/sorting in JavaScript/TypeScript).
 * Computes total items, total pages, slices the current page, and checks if completed.
 */
export function paginateList<T>(
  items: T[],
  pageInput?: number,
  limitInput?: number
): PaginatedResult<T> {
  const page = toPositiveInteger(pageInput, 1);
  const limit = toPositiveInteger(limitInput, 10);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  const data = items.slice(startIndex, endIndex);

  return {
    data,
    total,
    page: currentPage,
    limit,
    totalPages,
    isDone: endIndex >= total,
  };
}
