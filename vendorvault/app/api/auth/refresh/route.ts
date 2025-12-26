/**
 * @route POST /api/auth/refresh - Refresh access token
 * @description Generate a new access token using refresh token from HTTP-only cookie
 * @access Public (requires valid refresh token)
 */

import { NextRequest, NextResponse } from "next/server";
import { ApiErrors } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from "@/lib/auth";

/**
 * POST /api/auth/refresh - Generate new access token
 *
 * @cookie {string} refreshToken - Refresh token stored in HTTP-only cookie
 *
 * @returns {object} - Success response with new access token
 */
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from HTTP-only cookie
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return ApiErrors.UNAUTHORIZED(
        "Refresh token is missing. Please login again."
      );
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return ApiErrors.UNAUTHORIZED(
        "Invalid or expired refresh token. Please login again."
      );
    }

    // Fetch user from database to ensure account is still active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return ApiErrors.UNAUTHORIZED("User not found. Please login again.");
    }

    if (!user.isActive) {
      return ApiErrors.FORBIDDEN(
        "Your account has been deactivated. Please contact support."
      );
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user.id, user.email, user.role);

    // Optional: Implement refresh token rotation for enhanced security
    // Generate new refresh token and invalidate old one
    const newRefreshToken = generateRefreshToken(user.id, user.email);

    // Create response with new access token
    const response = NextResponse.json(
      {
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken: newAccessToken,
          tokenType: "Bearer",
          expiresIn: "15m",
        },
      },
      { status: 200 }
    );

    // Update refresh token cookie (token rotation)
    response.cookies.set(
      "refreshToken",
      newRefreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS
    );

    return response;
  } catch (error) {
    console.error("Error refreshing token:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          error: "REFRESH_ERROR",
        },
        { status: 500 }
      );
    }

    return ApiErrors.INTERNAL_ERROR("Token refresh failed");
  }
}
