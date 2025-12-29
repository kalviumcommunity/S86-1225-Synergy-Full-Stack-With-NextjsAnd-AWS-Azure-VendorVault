/**
 * Audit Logging System
 * Tracks all access control decisions for security and compliance
 */

import { Role, Permission } from "@/config/roles";

/**
 * Access decision enum
 */
export enum AccessDecision {
  ALLOWED = "ALLOWED",
  DENIED = "DENIED",
}

/**
 * Access log entry structure
 */
export interface AccessLog {
  userId: number | null;
  role: Role | null;
  action: Permission | string;
  resource: string;
  decision: AccessDecision;
  reason?: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * In-memory store for access logs (in production, use database or external service)
 */
const accessLogs: AccessLog[] = [];

/**
 * Maximum number of logs to keep in memory
 */
const MAX_LOGS = 1000;

/**
 * Log an access control decision
 */
export function logAccess(log: AccessLog): void {
  // Add to in-memory store
  accessLogs.push(log);

  // Keep only recent logs
  if (accessLogs.length > MAX_LOGS) {
    accessLogs.shift();
  }

  // Console logging for development/debugging
  const emoji = log.decision === AccessDecision.ALLOWED ? "✅" : "❌";
  const logMessage = [
    `${emoji} [RBAC]`,
    `User: ${log.userId || "anonymous"}`,
    `Role: ${log.role || "none"}`,
    `Action: ${log.action}`,
    `Resource: ${log.resource}`,
    `Decision: ${log.decision}`,
    log.reason ? `Reason: ${log.reason}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  if (log.decision === AccessDecision.DENIED) {
    console.warn(logMessage);
  } else {
    console.log(logMessage);
  }

  // In production, you might want to:
  // 1. Send to a logging service (e.g., Winston, Pino)
  // 2. Store in database for compliance
  // 3. Send alerts for suspicious patterns
  // 4. Aggregate metrics for security dashboard
}

/**
 * Get all access logs (for admin dashboard)
 */
export function getAccessLogs(filters?: {
  userId?: number;
  role?: Role;
  decision?: AccessDecision;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): AccessLog[] {
  let filtered = [...accessLogs];

  if (filters) {
    if (filters.userId !== undefined) {
      filtered = filtered.filter((log) => log.userId === filters.userId);
    }
    if (filters.role) {
      filtered = filtered.filter((log) => log.role === filters.role);
    }
    if (filters.decision) {
      filtered = filtered.filter((log) => log.decision === filters.decision);
    }
    if (filters.startDate) {
      filtered = filtered.filter((log) => log.timestamp >= filters.startDate!);
    }
    if (filters.endDate) {
      filtered = filtered.filter((log) => log.timestamp <= filters.endDate!);
    }
    if (filters.limit) {
      filtered = filtered.slice(-filters.limit);
    }
  }

  return filtered.reverse(); // Most recent first
}

/**
 * Get access log statistics
 */
export function getAccessStats(): {
  total: number;
  allowed: number;
  denied: number;
  byRole: Record<string, { allowed: number; denied: number }>;
  recentDenials: AccessLog[];
} {
  const total = accessLogs.length;
  const allowed = accessLogs.filter(
    (log) => log.decision === AccessDecision.ALLOWED
  ).length;
  const denied = accessLogs.filter(
    (log) => log.decision === AccessDecision.DENIED
  ).length;

  // Statistics by role
  const byRole: Record<string, { allowed: number; denied: number }> = {};
  accessLogs.forEach((log) => {
    if (log.role) {
      if (!byRole[log.role]) {
        byRole[log.role] = { allowed: 0, denied: 0 };
      }
      if (log.decision === AccessDecision.ALLOWED) {
        byRole[log.role].allowed++;
      } else {
        byRole[log.role].denied++;
      }
    }
  });

  // Recent denials (last 10)
  const recentDenials = accessLogs
    .filter((log) => log.decision === AccessDecision.DENIED)
    .slice(-10)
    .reverse();

  return {
    total,
    allowed,
    denied,
    byRole,
    recentDenials,
  };
}

/**
 * Clear old logs (useful for testing or scheduled cleanup)
 */
export function clearOldLogs(beforeDate: Date): number {
  const initialLength = accessLogs.length;
  const filtered = accessLogs.filter((log) => log.timestamp >= beforeDate);
  accessLogs.length = 0;
  accessLogs.push(...filtered);
  return initialLength - accessLogs.length;
}

/**
 * Export logs to JSON (for external analysis)
 */
export function exportLogs(
  filters?: Parameters<typeof getAccessLogs>[0]
): string {
  const logs = getAccessLogs(filters);
  return JSON.stringify(logs, null, 2);
}

/**
 * Detect suspicious patterns in access logs
 */
export function detectSuspiciousActivity(): {
  suspiciousUsers: number[];
  patterns: string[];
} {
  const suspiciousUsers = new Set<number>();
  const patterns: string[] = [];

  // Pattern 1: Multiple failed access attempts from same user
  const userDenials = new Map<number, number>();
  accessLogs.forEach((log) => {
    if (log.userId && log.decision === AccessDecision.DENIED) {
      userDenials.set(log.userId, (userDenials.get(log.userId) || 0) + 1);
    }
  });

  userDenials.forEach((count, userId) => {
    if (count >= 5) {
      suspiciousUsers.add(userId);
      patterns.push(
        `User ${userId} has ${count} denied access attempts (possible privilege escalation)`
      );
    }
  });

  // Pattern 2: Access attempts outside business hours (if needed)
  // Pattern 3: Unusual access patterns (if needed)

  return {
    suspiciousUsers: Array.from(suspiciousUsers),
    patterns,
  };
}

/**
 * Log a security event (broader than access control)
 */
export function logSecurityEvent(event: {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  userId?: number;
  description: string;
  metadata?: Record<string, unknown>;
}): void {
  const logMessage = `🔒 [SECURITY] ${event.severity.toUpperCase()} | ${event.type} | ${event.description}`;

  if (event.severity === "critical" || event.severity === "high") {
    console.error(logMessage, event.metadata);
  } else {
    console.warn(logMessage, event.metadata);
  }

  // In production: send alerts, store in database, notify security team
}
