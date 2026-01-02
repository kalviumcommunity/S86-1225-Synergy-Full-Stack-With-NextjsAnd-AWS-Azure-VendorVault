/**
 * @route POST /api/auth/login - User authentication with JWT token generation
 * @description Authenticate user with email and password, return JWT token
 * @access Public
 */

import { NextRequest, NextResponse } from "next/server";
import { ApiErrors } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from "@/lib/auth";
import { loginSchema } from "@/lib/schemas/authSchema";
import { validateRequestData } from "@/lib/validation";

// JWT Secret from environment variable (fallback for development only)
// No longer needed - using auth.ts functions

/**
 * POST /api/auth/login - Authenticate user and generate JWT token
 *
 * @body {string} email - User's email address
 * @body {string} password - User's password
 *
 * @returns {object} - Success response with JWT token and user data
 */
export async function POST(request: NextRequest) {
  try {
    // Validate request data with Zod schema
    const validation = await validateRequestData(request, loginSchema);
    if (!validation.success) {
      return validation.response;
    }

    const body = validation.data as {
      email: string;
      password: string;
    };

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
        createdAt: true,
      },
    });

    // User not found - return generic error for security
    if (!user) {
      return ApiErrors.UNAUTHORIZED("Invalid email or password");
    }

    // Check if user account is active
    if (!user.isActive) {
      return ApiErrors.FORBIDDEN(
        "Your account has been deactivated. Please contact support."
      );
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(
      body.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return ApiErrors.UNAUTHORIZED("Invalid email or password");
    }

    // Generate Access Token (short-lived, 15 minutes)
    const accessToken = generateAccessToken(user.id, user.email, user.role);

    // Generate Refresh Token (long-lived, 7 days)
    const refreshToken = generateRefreshToken(user.id, user.email);

    // Remove password hash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;

    // Create response with access token in body
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: {
          user: userWithoutPassword,
          accessToken,
          tokenType: "Bearer",
          expiresIn: "15m",
        },
      },
      { status: 200 }
    );

    // Set refresh token as HTTP-only cookie (secure storage)
    response.cookies.set(
      "refreshToken",
      refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS
    );

    return response;
  } catch (error) {
    console.error("Error during user authentication:", error);

    if (error instanceof Error) {
      return ApiErrors.INTERNAL_ERROR(error.message);
    }

    return ApiErrors.INTERNAL_ERROR("Authentication failed. Please try again.");
  }
}
