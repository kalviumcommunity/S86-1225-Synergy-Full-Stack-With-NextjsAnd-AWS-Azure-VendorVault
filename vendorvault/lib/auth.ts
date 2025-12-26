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
  role?: string;
  type?: "access" | "refresh";
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
 * Generate JWT access token for a user (short-lived)
 *
 * @param userId - User ID
 * @param email - User email
 * @param role - User role
 * @returns JWT access token string
 */
export function generateAccessToken(
  userId: number,
  email: string,
  role: string
): string {
  const expiresIn = process.env.JWT_ACCESS_EXPIRY || "15m"; // 15 minutes default

  return jwt.sign(
    {
      id: userId,
      email,
      role,
      type: "access",
    },
    JWT_SECRET,
    {
      expiresIn,
      issuer: "vendorvault-api",
      audience: "vendorvault-client",
    } as jwt.SignOptions
  );
}

/**
 * Generate JWT refresh token for a user (long-lived)
 *
 * @param userId - User ID
 * @param email - User email
 * @returns JWT refresh token string
 */
export function generateRefreshToken(userId: number, email: string): string {
  const expiresIn = process.env.JWT_REFRESH_EXPIRY || "7d"; // 7 days default

  return jwt.sign(
    {
      id: userId,
      email,
      type: "refresh",
    },
    JWT_SECRET,
    {
      expiresIn,
      issuer: "vendorvault-api",
      audience: "vendorvault-client",
    } as jwt.SignOptions
  );
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use generateAccessToken instead
 */
export function generateToken(
  userId: number,
  email: string,
  role: string
): string {
  return generateAccessToken(userId, email, role);
}

/**
 * Verify refresh token
 *
 * @param token - Refresh token string
 * @returns Decoded token payload or null if invalid
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "vendorvault-api",
      audience: "vendorvault-client",
    }) as JWTPayload;

    // Ensure it's a refresh token
    if (decoded.type !== "refresh") {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Refresh token verification error:", error);
    return null;
  }
}

/**
 * Cookie options for secure token storage
 */
export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true, // Prevent XSS attacks
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "strict" as const, // Prevent CSRF attacks
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  path: "/",
};
