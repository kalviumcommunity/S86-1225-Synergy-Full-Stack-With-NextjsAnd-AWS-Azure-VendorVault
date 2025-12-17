/**
 * Authentication Middleware Utilities
 * Reusable functions for JWT token validation and route protection
 */

import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { ApiErrors } from "@/lib/api-response";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

/**
 * JWT Payload Interface
 */
export interface JWTPayload {
  id: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

/**
 * Verify JWT token from request headers
 *
 * @param request - NextRequest object
 * @returns Decoded JWT payload or null if invalid
 */
export async function verifyToken(
  request: NextRequest
): Promise<JWTPayload | null> {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return null;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "vendorvault-api",
      audience: "vendorvault-client",
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

/**
 * Middleware to protect routes requiring authentication
 * Returns error response if token is invalid or missing
 *
 * @param request - NextRequest object
 * @returns JWTPayload if valid, or NextResponse error if invalid
 */
export async function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return {
      error: ApiErrors.UNAUTHORIZED("Authorization header is missing"),
      user: null,
    };
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return {
      error: ApiErrors.UNAUTHORIZED(
        "Token is missing from Authorization header"
      ),
      user: null,
    };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "vendorvault-api",
      audience: "vendorvault-client",
    }) as JWTPayload;

    return {
      error: null,
      user: decoded,
    };
  } catch (jwtError) {
    if (jwtError instanceof jwt.TokenExpiredError) {
      return {
        error: ApiErrors.UNAUTHORIZED("Token has expired. Please login again."),
        user: null,
      };
    }
    if (jwtError instanceof jwt.JsonWebTokenError) {
      return {
        error: ApiErrors.FORBIDDEN("Invalid or malformed token"),
        user: null,
      };
    }

    return {
      error: ApiErrors.INTERNAL_ERROR("Token validation failed"),
      user: null,
    };
  }
}

/**
 * Middleware to check if user has required role
 *
 * @param user - Decoded JWT payload
 * @param allowedRoles - Array of allowed roles
 * @returns true if user has required role, false otherwise
 */
export function hasRole(user: JWTPayload, allowedRoles: string[]): boolean {
  return allowedRoles.includes(user.role);
}

/**
 * Generate JWT token for a user
 *
 * @param userId - User ID
 * @param email - User email
 * @param role - User role
 * @returns JWT token string
 */
export function generateToken(
  userId: number,
  email: string,
  role: string
): string {
  const expiresIn = process.env.JWT_EXPIRY || "1h";

  return jwt.sign(
    {
      id: userId,
      email,
      role,
    },
    JWT_SECRET,
    {
      expiresIn,
      issuer: "vendorvault-api",
      audience: "vendorvault-client",
    } as jwt.SignOptions
  );
}
