/**
 * @route GET /api/users - Protected route demonstrating JWT token validation
 * @description Get current user information (requires valid JWT token)
 * @access Private (Requires authentication)
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse, ApiErrors } from "@/lib/api-response";
import jwt from "jsonwebtoken";

// JWT Secret from environment variable
const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// Define JWT payload type
interface JWTPayload {
  id: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

/**
 * GET /api/users - Get current authenticated user information
 *
 * @header {string} Authorization - Bearer token (format: "Bearer <token>")
 *
 * @returns {object} - Success response with user data from token
 */
export async function GET(request: NextRequest) {
  try {
    // Get Authorization header
    const authHeader = request.headers.get("authorization");

    // Check if Authorization header exists
    if (!authHeader) {
      return ApiErrors.UNAUTHORIZED("Authorization header is missing");
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.split(" ")[1];

    if (!token) {
      return ApiErrors.UNAUTHORIZED(
        "Token is missing from Authorization header"
      );
    }

    // Verify and decode JWT token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET, {
        issuer: "vendorvault-api",
        audience: "vendorvault-client",
      }) as JWTPayload;
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        return ApiErrors.UNAUTHORIZED("Token has expired. Please login again.");
      }
      if (jwtError instanceof jwt.JsonWebTokenError) {
        return ApiErrors.FORBIDDEN("Invalid or malformed token");
      }
      throw jwtError;
    }

    // Token is valid - return user information
    return successResponse(
      {
        user: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        },
        tokenInfo: {
          issuedAt: decoded.iat
            ? new Date(decoded.iat * 1000).toISOString()
            : undefined,
          expiresAt: decoded.exp
            ? new Date(decoded.exp * 1000).toISOString()
            : undefined,
        },
        message: "Access granted to protected resource",
      },
      "Token validated successfully"
    );
  } catch (error) {
    console.error("Error validating token:", error);

    if (error instanceof Error) {
      return errorResponse(error.message, "TOKEN_VALIDATION_ERROR", 500);
    }

    return ApiErrors.INTERNAL_ERROR("Token validation failed");
  }
}
