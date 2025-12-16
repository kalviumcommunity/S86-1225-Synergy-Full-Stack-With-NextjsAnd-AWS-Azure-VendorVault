import { NextResponse } from "next/server";

/**
 * Global API Response Handler
 *
 * Provides consistent response structure across all API endpoints
 * following RESTful best practices with unified envelope format
 */

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details?: unknown;
  };
  timestamp: string;
}

/**
 * Success response helper
 * Returns a standardized success response with timestamp
 */
export function successResponse<T>(
  data: T,
  message: string = "Success",
  pagination?: ApiSuccessResponse<T>["pagination"],
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    ...(pagination && { pagination }),
  };

  return NextResponse.json(response, { status });
}

/**
 * Error response helper
 * Returns a standardized error response with timestamp
 */
export function errorResponse(
  message: string,
  code: string,
  status: number = 400,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    message,
    error: {
      code,
      ...(details !== undefined && { details }),
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
}

/**
 * Standard Error Codes Dictionary
 * Maintains consistency across all API endpoints
 */
export const ERROR_CODES = {
  // Client Errors (4xx)
  VALIDATION_ERROR: "E001",
  NOT_FOUND: "E002",
  UNAUTHORIZED: "E003",
  FORBIDDEN: "E004",
  BAD_REQUEST: "E005",
  CONFLICT: "E006",

  // Server Errors (5xx)
  INTERNAL_ERROR: "E500",
  DATABASE_ERROR: "E501",
  EXTERNAL_SERVICE_ERROR: "E502",

  // Business Logic Errors
  USER_FETCH_ERROR: "E100",
  USER_CREATE_ERROR: "E101",
  VENDOR_FETCH_ERROR: "E102",
  LICENSE_FETCH_ERROR: "E103",
  AUTH_ERROR: "E104",
  UPLOAD_ERROR: "E105",
  QR_GENERATION_ERROR: "E106",
} as const;

/**
 * Common error responses
 * Pre-configured error handlers for common scenarios
 */
export const ApiErrors = {
  NOT_FOUND: (resource: string) =>
    errorResponse(`${resource} not found`, ERROR_CODES.NOT_FOUND, 404),

  BAD_REQUEST: (message: string) =>
    errorResponse(message, ERROR_CODES.BAD_REQUEST, 400),

  UNAUTHORIZED: (message: string = "Unauthorized access") =>
    errorResponse(message, ERROR_CODES.UNAUTHORIZED, 401),

  FORBIDDEN: (message: string = "Access forbidden") =>
    errorResponse(message, ERROR_CODES.FORBIDDEN, 403),

  CONFLICT: (message: string) =>
    errorResponse(message, ERROR_CODES.CONFLICT, 409),

  INTERNAL_ERROR: (message: string = "Internal server error") =>
    errorResponse(message, ERROR_CODES.INTERNAL_ERROR, 500),

  VALIDATION_ERROR: (details: unknown) =>
    errorResponse(
      "Validation failed",
      ERROR_CODES.VALIDATION_ERROR,
      400,
      details
    ),
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
