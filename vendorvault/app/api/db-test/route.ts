import { NextResponse } from "next/server";
import {
  testPrismaConnection,
  testRawConnection,
  checkDatabaseHealth,
} from "@/lib/db-test";

/**
 * Database Health Check API
 * GET /api/db-test
 *
 * Tests database connectivity and returns health status
 */
export async function GET() {
  try {
    // Run connection tests
    const prismaTest = await testPrismaConnection();
    const rawTest = await testRawConnection();
    const healthCheck = await checkDatabaseHealth();

    const allPassed =
      prismaTest.success && rawTest.success && healthCheck.success;

    return NextResponse.json(
      {
        status: allPassed ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        tests: {
          prisma: {
            status: prismaTest.success ? "pass" : "fail",
            message: prismaTest.success
              ? "Connection successful"
              : "Connection failed",
            error:
              typeof prismaTest.error === "object" &&
              prismaTest.error !== null &&
              "message" in prismaTest.error
                ? (prismaTest.error as { message?: string }).message
                : null,
          },
          raw: {
            status: rawTest.success ? "pass" : "fail",
            message: rawTest.success
              ? "Connection successful"
              : "Connection failed",
            serverTime: rawTest.result?.server_time || null,
            error:
              typeof rawTest.error === "object" &&
              rawTest.error !== null &&
              "message" in rawTest.error
                ? (rawTest.error as { message?: string }).message
                : null,
          },
          health: {
            status: healthCheck.success ? "pass" : "fail",
            message: healthCheck.success
              ? "Database healthy"
              : "Health check failed",
            error:
              typeof healthCheck.error === "object" &&
              healthCheck.error !== null &&
              "message" in healthCheck.error
                ? (healthCheck.error as { message?: string }).message
                : null,
          },
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          databaseUrl: process.env.DATABASE_URL ? "configured" : "missing",
        },
      },
      {
        status: allPassed ? 200 : 503,
      }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Database test API error:", error);
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        message: "Failed to run database tests",
        error: errorMessage,
      },
      {
        status: 500,
      }
    );
  }
}
