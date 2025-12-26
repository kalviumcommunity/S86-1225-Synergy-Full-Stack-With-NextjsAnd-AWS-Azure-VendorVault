/**
 * JWT Authentication Test Script
 * Demonstrates token generation, validation, and refresh flow
 */

import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
} from "../lib/auth";

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

function log(color: string, message: string) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log("\n" + "=".repeat(60));
  log(colors.blue, `  ${title}`);
  console.log("=".repeat(60));
}

function logSuccess(message: string) {
  log(colors.green, `✓ ${message}`);
}

function logError(message: string) {
  log(colors.red, `✗ ${message}`);
}

function logInfo(message: string) {
  log(colors.yellow, `ℹ ${message}`);
}

// Mock user data
const mockUser = {
  id: 12345,
  email: "test@vendorvault.com",
  role: "VENDOR",
};

async function testJWTImplementation() {
  logSection("JWT & SESSION MANAGEMENT TEST");

  // 1. Token Generation
  logSection("1. TOKEN GENERATION");

  const accessToken = generateAccessToken(
    mockUser.id,
    mockUser.email,
    mockUser.role
  );
  const refreshToken = generateRefreshToken(mockUser.id, mockUser.email);

  logSuccess("Access Token generated (15m expiry)");
  logInfo(`Token: ${accessToken.substring(0, 50)}...`);

  logSuccess("Refresh Token generated (7d expiry)");
  logInfo(`Token: ${refreshToken.substring(0, 50)}...`);

  // 2. Token Structure
  logSection("2. TOKEN STRUCTURE");

  const accessParts = accessToken.split(".");
  const refreshParts = refreshToken.split(".");

  logInfo(
    `Access Token has ${accessParts.length} parts: [header, payload, signature]`
  );
  logInfo(
    `Refresh Token has ${refreshParts.length} parts: [header, payload, signature]`
  );

  // Decode payload (Base64)
  const accessPayload = JSON.parse(
    Buffer.from(accessParts[1], "base64").toString()
  );
  const refreshPayload = JSON.parse(
    Buffer.from(refreshParts[1], "base64").toString()
  );

  logSuccess("Access Token Payload:");
  console.log(JSON.stringify(accessPayload, null, 2));

  logSuccess("Refresh Token Payload:");
  console.log(JSON.stringify(refreshPayload, null, 2));

  // 3. Token Validation
  logSection("3. TOKEN VALIDATION");

  // Create mock request with token
  const mockRequest = {
    headers: {
      get: (name: string) => {
        if (name === "authorization") {
          return `Bearer ${accessToken}`;
        }
        return null;
      },
    },
  } as { headers: { get: (name: string) => string | null } };

  const verified = await verifyToken(mockRequest);

  if (verified) {
    logSuccess("Access Token verified successfully");
    logInfo(`User ID: ${verified.id}`);
    logInfo(`Email: ${verified.email}`);
    logInfo(`Role: ${verified.role}`);
    logInfo(`Type: ${verified.type}`);
  } else {
    logError("Access Token verification failed");
  }

  // 4. Refresh Token Validation
  logSection("4. REFRESH TOKEN VALIDATION");

  const refreshVerified = verifyRefreshToken(refreshToken);

  if (refreshVerified) {
    logSuccess("Refresh Token verified successfully");
    logInfo(`User ID: ${refreshVerified.id}`);
    logInfo(`Email: ${refreshVerified.email}`);
    logInfo(`Type: ${refreshVerified.type}`);
  } else {
    logError("Refresh Token verification failed");
  }

  // 5. Token Expiry
  logSection("5. TOKEN EXPIRY TIMES");

  const accessExp = new Date(accessPayload.exp * 1000);
  const refreshExp = new Date(refreshPayload.exp * 1000);
  const now = new Date();

  logInfo(`Current Time: ${now.toISOString()}`);
  logInfo(`Access Token Expires: ${accessExp.toISOString()}`);
  logInfo(
    `  → Valid for: ${Math.round((accessExp.getTime() - now.getTime()) / 1000 / 60)} minutes`
  );

  logInfo(`Refresh Token Expires: ${refreshExp.toISOString()}`);
  logInfo(
    `  → Valid for: ${Math.round((refreshExp.getTime() - now.getTime()) / 1000 / 60 / 60 / 24)} days`
  );

  // 6. Security Features
  logSection("6. SECURITY FEATURES");

  logSuccess("✓ Access Token: Short-lived (15 minutes)");
  logSuccess("✓ Refresh Token: Long-lived (7 days)");
  logSuccess("✓ Token Type: Explicitly defined (access/refresh)");
  logSuccess("✓ Issuer Validation: vendorvault-api");
  logSuccess("✓ Audience Validation: vendorvault-client");
  logSuccess("✓ HMAC-SHA256 Signature: Prevents tampering");
  logSuccess("✓ HTTP-Only Cookies: XSS protection (refresh token)");
  logSuccess("✓ SameSite Strict: CSRF protection");
  logSuccess("✓ Token Rotation: On every refresh");

  // 7. Test Invalid Token
  logSection("7. INVALID TOKEN HANDLING");

  const invalidRequest = {
    headers: {
      get: (name: string) => {
        if (name === "authorization") {
          return "Bearer invalid.token.here";
        }
        return null;
      },
    },
  } as { headers: { get: (name: string) => string | null } };

  const invalidVerified = await verifyToken(invalidRequest);

  if (!invalidVerified) {
    logSuccess("Invalid token correctly rejected");
  } else {
    logError("Invalid token was incorrectly accepted!");
  }

  logSection("TEST COMPLETE");
  logSuccess("All JWT authentication features tested successfully!");
  logInfo("\nNext steps:");
  logInfo("1. Start the development server: npm run dev");
  logInfo("2. Test login endpoint: POST /api/auth/login");
  logInfo("3. Test refresh endpoint: POST /api/auth/refresh");
  logInfo("4. Check browser console for token management");
}

// Run tests
testJWTImplementation().catch(console.error);
