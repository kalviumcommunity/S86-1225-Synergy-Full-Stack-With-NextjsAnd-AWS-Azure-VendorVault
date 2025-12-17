/**
 * @route POST /api/auth/signup - User registration with secure password hashing
 * @description Register a new user with bcrypt password hashing
 * @access Public
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse, ApiErrors } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/schemas/authSchema";
import { validateRequestData } from "@/lib/validation";

/**
 * POST /api/auth/signup - Register new user
 *
 * @body {string} name - User's full name
 * @body {string} email - User's email address
 * @body {string} password - User's password (will be hashed)
 * @body {string} role - User role (VENDOR, ADMIN, INSPECTOR)
 *
 * @returns {object} - Success response with user data (password excluded)
 */
export async function POST(request: NextRequest) {
  try {
    // Validate request data with Zod schema
    const validation = await validateRequestData(request, registerSchema);
    if (!validation.success) {
      return validation.response;
    }

    const body = validation.data as {
      name: string;
      email: string;
      password: string;
      role: "VENDOR" | "ADMIN" | "INSPECTOR";
    };

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return ApiErrors.BAD_REQUEST("User with this email already exists");
    }

    // Hash the password with bcrypt (10 salt rounds)
    // Salt rounds determine the computational cost - higher = more secure but slower
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create new user with hashed password
    const newUser = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash: hashedPassword,
        role: body.role,
        isActive: true,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    return successResponse(
      {
        user: newUser,
        message: "Account created successfully. Please verify your email.",
      },
      "Signup successful"
    );
  } catch (error) {
    console.error("Error during user registration:", error);

    if (error instanceof Error) {
      return errorResponse(error.message, "SIGNUP_ERROR", 500);
    }

    return ApiErrors.INTERNAL_ERROR("Signup failed. Please try again.");
  }
}
