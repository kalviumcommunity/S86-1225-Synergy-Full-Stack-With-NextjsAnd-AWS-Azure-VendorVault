/**
 * Logging Demo API Route
 *
 * Demonstrates structured logging with:
 * - Request/response logging
 * - Error handling and logging
 * - Performance metrics
 * - Correlation IDs
 */

import { NextRequest, NextResponse } from "next/server";
import { logger, Logger, PerformanceTimer } from "@/lib/logger";

export async function GET(req: NextRequest) {
  // Generate correlation ID
  const requestId = Logger.generateRequestId();
  const metadata = {
    ...Logger.extractRequestMetadata(req),
    requestId,
  };

  // Start performance timer
  const timer = new PerformanceTimer("GET /api/logging-demo");

  // Log incoming request
  logger.logRequest(metadata);

  try {
    // Simulate some processing
    logger.info("Processing demo request", { requestId });

    // Simulate database query
    const queryTimer = new PerformanceTimer("Database query");
    await new Promise((resolve) => setTimeout(resolve, 50));
    const queryDuration = queryTimer.end();
    logger.logDatabaseQuery("SELECT * FROM demo WHERE id = ?", queryDuration, {
      requestId,
    });

    // Simulate business logic
    logger.debug("Executing business logic", {
      requestId,
      step: "validation",
    });

    // Log a custom metric
    logger.logMetric("demo_requests", 1, "count", { requestId });

    // Prepare response
    const response = {
      message: "Logging demo successful",
      requestId,
      timestamp: new Date().toISOString(),
      data: {
        processed: true,
        queryDuration,
      },
    };

    // Log successful response
    const duration = timer.end();
    logger.logResponse({
      ...metadata,
      statusCode: 200,
      duration,
    });

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "X-Request-ID": requestId,
      },
    });
  } catch (error) {
    // Log error with full context
    const duration = timer.end();
    logger.error("Error processing request", error as Error, {
      ...metadata,
      duration,
      statusCode: 500,
    });

    return NextResponse.json(
      {
        error: "Internal Server Error",
        requestId,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: {
          "X-Request-ID": requestId,
        },
      }
    );
  }
}

export async function POST(req: NextRequest) {
  const requestId = Logger.generateRequestId();
  const metadata = {
    ...Logger.extractRequestMetadata(req),
    requestId,
  };

  const timer = new PerformanceTimer("POST /api/logging-demo");
  logger.logRequest(metadata);

  try {
    const body = await req.json();

    // Validate input
    if (!body || typeof body !== "object") {
      logger.warn("Invalid request body", {
        requestId,
        bodyType: typeof body,
      });

      return NextResponse.json(
        { error: "Invalid request body", requestId },
        { status: 400 }
      );
    }

    // Simulate error scenario if requested
    if (body.simulateError) {
      logger.warn("Simulating error as requested", { requestId });
      throw new Error("Simulated error for testing");
    }

    // Process request
    logger.info("Processing POST request", {
      requestId,
      dataKeys: Object.keys(body),
    });

    const duration = timer.end();
    logger.logResponse({
      ...metadata,
      statusCode: 200,
      duration,
    });

    return NextResponse.json(
      {
        message: "Data processed successfully",
        requestId,
        received: body,
        processingTime: duration,
      },
      {
        status: 200,
        headers: { "X-Request-ID": requestId },
      }
    );
  } catch (error) {
    const duration = timer.end();
    logger.error("Error processing POST request", error as Error, {
      ...metadata,
      duration,
      statusCode: 500,
    });

    return NextResponse.json(
      {
        error: "Internal Server Error",
        requestId,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: { "X-Request-ID": requestId },
      }
    );
  }
}
