/**
 * Next.js Middleware
 * Global security and authentication middleware
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  addSecurityHeaders,
  validateCSRF,
  checkRateLimit,
  getClientIP,
} from "./lib/security";

/**
 * Middleware function runs before every request
 */
export function middleware(request: NextRequest) {
  // Get client IP for rate limiting
  const clientIP = getClientIP(request);

  // Apply rate limiting (100 requests per minute per IP)
  if (!checkRateLimit(clientIP, 100, 60000)) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many requests. Please try again later.",
        error: "RATE_LIMIT_EXCEEDED",
      },
      { status: 429 }
    );
  }

  // Validate CSRF for state-changing operations
  if (!validateCSRF(request)) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request origin. Possible CSRF attack detected.",
        error: "CSRF_VALIDATION_FAILED",
      },
      { status: 403 }
    );
  }

  // Continue with the request
  const response = NextResponse.next();

  // Add security headers to response
  return addSecurityHeaders(response);
}

/**
 * Configure which routes the middleware runs on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico).*)",
  ],
};
