/**
 * @route POST /api/auth/logout - User logout
 * @description Clear refresh token cookie and invalidate session
 * @access Public
 */

import { NextResponse } from "next/server";

/**
 * POST /api/auth/logout - Logout user and clear tokens
 *
 * @returns {object} - Success response
 */
export async function POST() {
  try {
    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Logout successful",
      },
      { status: 200 }
    );

    // Clear refresh token cookie
    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error during logout:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
        error: "LOGOUT_ERROR",
      },
      { status: 500 }
    );
  }
}
