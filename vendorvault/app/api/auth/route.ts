/**
 * @route POST /api/auth - User authentication
 * @description Authenticate user with email and password
 * @access Public
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse, ApiErrors } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/schemas/authSchema";
import { validateRequestData } from "@/lib/validation";

/**
 * POST /api/auth - Login
 */
export async function POST(request: NextRequest) {
  try {
    // Validate request data with Zod
    const validation = await validateRequestData(request, loginSchema);
    if (!validation.success) {
      return validation.response;
    }

    const body = validation.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: body.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        isActive: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return ApiErrors.UNAUTHORIZED("Invalid email or password");
    }

    // Check if user is active
    if (!user.isActive) {
      return ApiErrors.FORBIDDEN("Account is deactivated");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      body.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return ApiErrors.UNAUTHORIZED("Invalid email or password");
    }

    // Remove password hash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;

    return successResponse(
      {
        user: userWithoutPassword,
        // In a real application, generate and return JWT token here
        token: "JWT_TOKEN_PLACEHOLDER",
      },
      "Login successful"
    );
  } catch (error) {
    console.error("Error authenticating user:", error);

    if (error instanceof Error) {
      return errorResponse(error.message, "AUTH_ERROR", 500);
    }

    return ApiErrors.INTERNAL_ERROR("Authentication failed");
  }
}
