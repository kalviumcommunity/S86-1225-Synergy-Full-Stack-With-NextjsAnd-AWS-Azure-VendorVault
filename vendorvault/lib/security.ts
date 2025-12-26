/**
 * Security Middleware
 * Protection against XSS, CSRF, and other common security threats
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Security headers to prevent XSS and other attacks
 */
export const SECURITY_HEADERS = {
  // Prevent clickjacking attacks
  "X-Frame-Options": "DENY",

  // Enable browser XSS protection
  "X-XSS-Protection": "1; mode=block",

  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // Referrer policy
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Content Security Policy (CSP) - prevents XSS
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Be more restrictive in production
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join("; "),

  // Permissions policy
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

/**
 * Apply security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * CSRF Token validation for state-changing operations
 * Validates Origin and Referer headers
 */
export function validateCSRF(request: NextRequest): boolean {
  // Skip CSRF check for GET, HEAD, OPTIONS
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    return true;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  // In production, validate that origin matches host
  if (process.env.NODE_ENV === "production") {
    // Check Origin header
    if (origin) {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        console.warn("CSRF: Origin mismatch", { origin: originHost, host });
        return false;
      }
    }

    // Check Referer header as fallback
    if (!origin && referer) {
      const refererHost = new URL(referer).host;
      if (refererHost !== host) {
        console.warn("CSRF: Referer mismatch", { referer: refererHost, host });
        return false;
      }
    }

    // Require at least one header in production
    if (!origin && !referer) {
      console.warn("CSRF: Missing Origin and Referer headers");
      return false;
    }
  }

  return true;
}

/**
 * Input sanitization to prevent XSS
 * Removes potentially dangerous HTML/JS code
 */
export function sanitizeInput(input: string): string {
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, "");

  // Remove script tags and content
  sanitized = sanitized.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ""
  );

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");

  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, "");

  return sanitized.trim();
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj: unknown): unknown {
  if (typeof obj === "string") {
    return sanitizeInput(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (obj && typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Rate limiting helper
 * Simple in-memory rate limiter (use Redis in production)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // Clean up old entries
  if (record && record.resetTime < now) {
    rateLimitMap.delete(identifier);
  }

  if (!record || record.resetTime < now) {
    // Create new record
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  // Check if limit exceeded
  if (record.count >= maxRequests) {
    return false;
  }

  // Increment counter
  record.count++;
  return true;
}

/**
 * Get client IP address for rate limiting
 */
export function getClientIP(request: NextRequest): string {
  // Check various headers for real IP (behind proxy/CDN)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback to connection IP
  return request.ip || "unknown";
}
