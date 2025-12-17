/**
 * @route POST /api/auth/login - User authentication with JWT token generation
 * @description Authenticate user with email and password, return JWT token
 * @access Public
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse, ApiErrors } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { loginSchema } from "@/lib/schemas/authSchema";
import { validateRequestData } from "@/lib/validation";

// JWT Secret from environment variable (fallback for development only)
const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "1h"; // Default: 1 hour

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

    // Generate JWT token with user information
    // Token payload includes user ID, email, and role for authorization
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRY as string, // Token expires after specified duration
        issuer: "vendorvault-api",
        audience: "vendorvault-client",
      } as jwt.SignOptions
    );

    // Remove password hash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;

    return successResponse(
      {
        user: userWithoutPassword,
        token,
        expiresIn: JWT_EXPIRY,
        tokenType: "Bearer",
      },
      "Login successful"
    );
  } catch (error) {
    console.error("Error during user authentication:", error);

    if (error instanceof Error) {
      return errorResponse(error.message, "AUTH_ERROR", 500);
    }

    return ApiErrors.INTERNAL_ERROR("Authentication failed. Please try again.");
  }
}
