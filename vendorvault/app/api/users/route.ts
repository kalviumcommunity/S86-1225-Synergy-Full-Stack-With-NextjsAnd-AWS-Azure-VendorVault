/**
 * @route GET /api/users - Protected route accessible to all authenticated users
 * @description Get current user information (requires valid JWT token)
 * @access Private (All authenticated roles: ADMIN, VENDOR, INSPECTOR)
 */

import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";

/**
 * GET /api/users - Get current authenticated user information
 *
 * @header {string} Authorization - Bearer token (format: "Bearer <token>")
 * @header {string} x-user-id - User ID (set by middleware)
 * @header {string} x-user-email - User email (set by middleware)
 * @header {string} x-user-role - User role (set by middleware)
 *
 * @returns {object} - Success response with complete user data from database
 */
export async function GET(request: NextRequest) {
  // User is already authenticated by middleware
  // We can safely access user info from headers
  const userId = request.headers.get("x-user-id");
  const userRole = request.headers.get("x-user-role");

  // Check Redis cache first
  const cacheKey = `user:${userId}`;
  try {
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      console.log("✅ Cache Hit - User data served from Redis");
      return successResponse(
        JSON.parse(cachedData),
        "User information retrieved successfully (cached)"
      );
    }
  } catch (redisError) {
    console.warn(
      "⚠️ Redis cache read failed, falling back to database:",
      redisError
    );
  }

  console.log("❌ Cache Miss - Fetching user data from database");

  // Fetch complete user information from database
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId!) },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      vendor: {
        select: {
          id: true,
          businessName: true,
          stallType: true,
          stationName: true,
        },
      },
    },
  });

  const responseData = {
    message: "User route accessible to all authenticated users.",
    role: userRole,
    user: user,
    accessLevel:
      "This route is available to ADMIN, VENDOR, and INSPECTOR roles.",
  };

  // Cache the response for 300 seconds (5 minutes)
  try {
    await redis.set(cacheKey, JSON.stringify(responseData), "EX", 300);
    console.log("💾 User data cached successfully");
  } catch (redisError) {
    console.warn("⚠️ Failed to cache user data:", redisError);
  }

  return successResponse(
    responseData,
    "User information retrieved successfully"
  );
}
