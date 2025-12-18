/**
 * Centralized Error Handler
 * Manages all application errors with environment-aware responses
 * - Development: Full error details and stack traces
 * - Production: Safe, minimal messages for end users
 */

import { NextResponse } from "next/server";
import { logger } from "./logger";

export function handleError(error: unknown, context: string) {
  const isProd = process.env.NODE_ENV === "production";

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const errorResponse = {
    success: false,
    message: isProd
      ? "Something went wrong. Please try again later."
      : errorMessage || "Unknown error",
    ...(isProd ? {} : { stack: errorStack }),
  };

  logger.error(`Error in ${context}`, {
    message: errorMessage,
    stack: isProd ? "REDACTED" : errorStack,
  });

  return NextResponse.json(errorResponse, { status: 500 });
}

/**
 * Safe JSON parsing with error handling
 */
export async function safeJsonParse(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new Error("Invalid JSON in request body");
  }
}
