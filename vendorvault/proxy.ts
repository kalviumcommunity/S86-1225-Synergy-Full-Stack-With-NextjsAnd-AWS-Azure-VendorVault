/**
 * Authorization Proxy (formerly Middleware)
 * Intercepts all incoming requests and validates JWT tokens
 * Enforces Role-Based Access Control (RBAC) across API routes
 *
 * Note: Renamed from middleware.ts to proxy.ts following Next.js 15+ convention
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

/**
 * JWT Payload Interface
 */
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
 * Proxy function that runs on every request
 * Validates JWT tokens and enforces role-based access control
 *
 * @param req - Next.js request object
 * @returns NextResponse - Either allows request to proceed or returns error
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Define protected route patterns and their required roles
  const protectedRoutes = [
    { path: "/api/admin", roles: ["ADMIN"] },
    { path: "/api/users", roles: ["ADMIN", "VENDOR", "INSPECTOR"] },
    { path: "/api/vendor/apply", roles: ["VENDOR"] },
    { path: "/api/vendor/upload", roles: ["VENDOR"] },
    { path: "/api/license/approve", roles: ["ADMIN"] },
    { path: "/api/license/generate-qr", roles: ["ADMIN"] },
    { path: "/api/vendors", roles: ["ADMIN", "INSPECTOR"] },
  ];

  // Check if current path matches any protected route
  const matchedRoute = protectedRoutes.find((route) =>
    pathname.startsWith(route.path)
  );

  // If route is protected, validate token and check role
  if (matchedRoute) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    // Missing token - return 401 Unauthorized
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required. Please provide a valid token.",
          error: "TOKEN_MISSING",
        },
        { status: 401 }
      );
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: "vendorvault-api",
        audience: "vendorvault-client",
      }) as JWTPayload;

      // Check if user has required role for this route
      if (!matchedRoute.roles.includes(decoded.role)) {
        return NextResponse.json(
          {
            success: false,
            message: `Access denied. This route requires one of the following roles: ${matchedRoute.roles.join(", ")}`,
            error: "INSUFFICIENT_PERMISSIONS",
            userRole: decoded.role,
            requiredRoles: matchedRoute.roles,
          },
          { status: 403 }
        );
      }

      // Token valid and user has required role - attach user info to headers
      // This allows downstream route handlers to access user info without re-verifying token
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", decoded.id.toString());
      requestHeaders.set("x-user-email", decoded.email);
      requestHeaders.set("x-user-role", decoded.role);

      // Allow request to proceed with modified headers
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      // Token verification failed - return 403 Forbidden
      let errorMessage = "Invalid or expired token";
      let errorCode = "TOKEN_INVALID";

      if (error instanceof jwt.TokenExpiredError) {
        errorMessage = "Token has expired. Please login again.";
        errorCode = "TOKEN_EXPIRED";
      } else if (error instanceof jwt.JsonWebTokenError) {
        errorMessage = "Invalid or malformed token";
        errorCode = "TOKEN_MALFORMED";
      }

      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
          error: errorCode,
        },
        { status: 403 }
      );
    }
  }

  // Route is not protected - allow request to proceed
  return NextResponse.next();
}

/**
 * Matcher configuration - defines which routes this proxy should run on
 * This optimizes performance by only running proxy on API routes
 */
export const config = {
  matcher: [
    "/api/:path*", // Match all API routes
    "/((?!_next/static|_next/image|favicon.ico).*)", // Exclude Next.js internal routes
  ],
};
