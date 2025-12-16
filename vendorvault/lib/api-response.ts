import { NextResponse } from "next/server";

/**
 * API Response Handler
 *
 * Provides consistent response structure across all API endpoints
 * following RESTful best practices
 */

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Success response helper
 */
export function successResponse<T>(
  data: T,
  message?: string,
  pagination?: ApiSuccessResponse["pagination"],
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
    ...(pagination && { pagination }),
  };

  return NextResponse.json(response, { status });
}

/**
 * Error response helper
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
    },
  };

  return NextResponse.json(response, { status });
}

/**
 * Common error responses
 */
export const ApiErrors = {
  NOT_FOUND: (resource: string) =>
    errorResponse("NOT_FOUND", `${resource} not found`, 404),

  BAD_REQUEST: (message: string) => errorResponse("BAD_REQUEST", message, 400),

  UNAUTHORIZED: (message: string = "Unauthorized access") =>
    errorResponse("UNAUTHORIZED", message, 401),

  FORBIDDEN: (message: string = "Access forbidden") =>
    errorResponse("FORBIDDEN", message, 403),

  CONFLICT: (message: string) => errorResponse("CONFLICT", message, 409),

  INTERNAL_ERROR: (message: string = "Internal server error") =>
    errorResponse("INTERNAL_SERVER_ERROR", message, 500),

  VALIDATION_ERROR: (details: unknown) =>
    errorResponse("VALIDATION_ERROR", "Validation failed", 400, details),
};

/**
 * Parse pagination parameters from URL search params
 */
export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get("limit")) || 10)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
