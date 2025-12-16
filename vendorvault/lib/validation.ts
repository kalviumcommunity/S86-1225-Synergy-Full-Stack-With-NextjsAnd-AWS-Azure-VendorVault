/**
 * Validation Utility
 * Provides helper functions for handling Zod validation errors
 */

import { ZodError, ZodSchema } from "zod";
import { NextResponse } from "next/server";

/**
 * Format Zod validation errors into a readable structure
 */
export function formatZodErrors(error: ZodError) {
  return error.errors.map((err) => ({
    field: err.path.join(".") || "root",
    message: err.message,
    code: err.code,
  }));
}

/**
 * Validation error response
 */
export function validationErrorResponse(
  errors: Array<{
    field: string;
    message: string;
    code?: string;
  }>
) {
  return NextResponse.json(
    {
      success: false,
      message: "Validation Error",
      errors,
    },
    { status: 400 }
  );
}

/**
 * Wrapper to validate request data and handle errors
 */
export async function validateRequestData<T>(
  request: Request,
  schema: ZodSchema
): Promise<
  { success: true; data: T } | { success: false; response: NextResponse }
> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = formatZodErrors(error);
      return {
        success: false,
        response: validationErrorResponse(formattedErrors),
      };
    }

    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          message: "Invalid request body",
          error: "Failed to parse JSON",
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Type helper to infer validated data type
 */
export type ValidatedData<T> = {
  success: true;
  data: T;
};

export type ValidationError = {
  success: false;
  response: NextResponse;
};
