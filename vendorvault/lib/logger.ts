/**
 * Structured Logging Utility for VendorVault
 *
 * Provides centralized logging with:
 * - JSON structured logs for cloud platforms
 * - Correlation IDs for request tracing
 * - Log levels (info, warn, error, debug)
 * - Performance metrics tracking
 * - Error context capture
 */

import { NextRequest } from "next/server";

// Log levels enum
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
}

// Log metadata interface
export interface LogMetadata {
  requestId?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  userAgent?: string;
  ip?: string;
  [key: string]: unknown;
}

// Log entry structure
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: LogMetadata;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  environment: string;
  service: string;
  version: string;
}

/**
 * Logger class for structured logging
 */
export class Logger {
  private service: string;
  private environment: string;
  private version: string;
  private enableConsole: boolean;

  constructor(
    service = "vendorvault",
    environment = process.env.NODE_ENV || "development",
    version = process.env.APP_VERSION || "1.0.0"
  ) {
    this.service = service;
    this.environment = environment;
    this.version = version;
    this.enableConsole = true;
  }

  /**
   * Generate a unique correlation ID
   */
  static generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Extract request metadata
   */
  static extractRequestMetadata(req: NextRequest | Request): LogMetadata {
    const headers = req.headers;

    return {
      method: req.method,
      endpoint: req.url,
      userAgent: headers.get("user-agent") || undefined,
      ip:
        headers.get("x-forwarded-for") || headers.get("x-real-ip") || undefined,
      requestId: headers.get("x-request-id") || this.generateRequestId(),
    };
  }

  /**
   * Format error object for logging
   */
  private formatError(error: Error | unknown): LogEntry["error"] {
    const err = error as Error;
    return {
      name: err.name || "Error",
      message: err.message || String(error),
      stack: err.stack,
      code: (err as Error & { code?: string }).code,
    };
  }

  /**
   * Create log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      environment: this.environment,
      service: this.service,
      version: this.version,
    };

    if (metadata) {
      entry.metadata = metadata;
    }

    if (error) {
      entry.error = this.formatError(error);
    }

    return entry;
  }

  /**
   * Write log to console (captured by CloudWatch/Azure Monitor)
   */
  private writeLog(entry: LogEntry): void {
    const logString = JSON.stringify(entry);

    if (!this.enableConsole) return;

    switch (entry.level) {
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(logString);
        break;
      case LogLevel.WARN:
        console.warn(logString);
        break;
      case LogLevel.DEBUG:
        if (this.environment === "development") {
          console.debug(logString);
        }
        break;
      default:
        console.log(logString);
    }
  }

  /**
   * Debug level logging
   */
  debug(message: string, metadata?: LogMetadata): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, metadata);
    this.writeLog(entry);
  }

  /**
   * Info level logging
   */
  info(message: string, metadata?: LogMetadata): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, metadata);
    this.writeLog(entry);
  }

  /**
   * Warning level logging
   */
  warn(message: string, metadata?: LogMetadata): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, metadata);
    this.writeLog(entry);
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error, metadata?: LogMetadata): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, metadata, error);
    this.writeLog(entry);
  }

  /**
   * Fatal level logging (critical errors)
   */
  fatal(message: string, error?: Error, metadata?: LogMetadata): void {
    const entry = this.createLogEntry(LogLevel.FATAL, message, metadata, error);
    this.writeLog(entry);
  }

  /**
   * Log API request start
   */
  logRequest(metadata: LogMetadata): void {
    this.info("API request received", metadata);
  }

  /**
   * Log API request completion
   */
  logResponse(metadata: LogMetadata): void {
    const level =
      metadata.statusCode && metadata.statusCode >= 400
        ? LogLevel.WARN
        : LogLevel.INFO;

    const message = `API request completed - ${metadata.statusCode || "unknown"} - ${metadata.duration || 0}ms`;

    const entry = this.createLogEntry(level, message, metadata);
    this.writeLog(entry);
  }

  /**
   * Log database query
   */
  logDatabaseQuery(
    query: string,
    duration: number,
    metadata?: LogMetadata
  ): void {
    this.debug("Database query executed", {
      ...metadata,
      query: query.substring(0, 200), // Truncate long queries
      duration,
    });
  }

  /**
   * Log performance metric
   */
  logMetric(
    metricName: string,
    value: number,
    unit: string,
    metadata?: LogMetadata
  ): void {
    this.info(`Metric: ${metricName}`, {
      ...metadata,
      metric: {
        name: metricName,
        value,
        unit,
      },
    });
  }
}

/**
 * Performance timer utility
 */
export class PerformanceTimer {
  private startTime: number;
  private label: string;

  constructor(label: string) {
    this.label = label;
    this.startTime = Date.now();
  }

  /**
   * End timer and return duration in milliseconds
   */
  end(): number {
    return Date.now() - this.startTime;
  }

  /**
   * End timer and log the duration
   */
  endAndLog(logger: Logger, metadata?: LogMetadata): number {
    const duration = this.end();
    logger.info(`${this.label} completed`, {
      ...metadata,
      duration,
    });
    return duration;
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();

/**
 * Middleware helper for request logging
 */
export function createRequestLogger(requestId?: string) {
  const id = requestId || Logger.generateRequestId();
  return {
    requestId: id,
    logger: new Logger(),
    timer: new PerformanceTimer("Request"),
  };
}

/**
 * Log wrapper for API routes
 */
export async function withLogging<T>(
  handler: (logger: Logger, metadata: LogMetadata) => Promise<T>,
  metadata: LogMetadata
): Promise<T> {
  const log = new Logger();
  const timer = new PerformanceTimer("API Handler");

  try {
    log.logRequest(metadata);
    const result = await handler(log, metadata);
    const duration = timer.end();
    log.logResponse({ ...metadata, duration, statusCode: 200 });
    return result;
  } catch (error) {
    const duration = timer.end();
    log.error("API request failed", error as Error, { ...metadata, duration });
    throw error;
  }
}
