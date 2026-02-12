/**
 * Operation logger for tracking all GraphQL calls
 * Logs to SQLite database for debugging and history
 */

import prisma from "./db.js";
import { randomUUID } from "crypto";

// Session ID for this MCP process instance
const sessionId = randomUUID();

// Check if logging is enabled (default: true)
const isLoggingEnabled =
  process.env.MCP_LOG_OPERATIONS !== "false";

// Max length for query/response strings in DB
const MAX_QUERY_LENGTH = 10000;
const MAX_RESPONSE_LENGTH = 50000;

/**
 * Get the current session ID
 */
export function getSessionId(): string {
  return sessionId;
}

/**
 * Truncate a string to a maximum length
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength) + "... [truncated]";
}

/**
 * Detect if a GraphQL operation is a query or mutation
 */
function detectOperationType(query: string): "query" | "mutation" {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.startsWith("mutation")) {
    return "mutation";
  }
  return "query";
}

/**
 * Log a GraphQL operation
 */
export async function logOperation(params: {
  storeDomain: string;
  toolName: string;
  query: string;
  variables?: Record<string, unknown>;
  response?: unknown;
  success: boolean;
  errorMessage?: string;
  durationMs: number;
}): Promise<void> {
  if (!isLoggingEnabled) {
    return;
  }

  try {
    await prisma.operationLog.create({
      data: {
        storeDomain: params.storeDomain,
        sessionId,
        toolName: params.toolName,
        operationType: detectOperationType(params.query),
        query: truncate(params.query, MAX_QUERY_LENGTH),
        variables: params.variables
          ? truncate(JSON.stringify(params.variables), MAX_QUERY_LENGTH)
          : null,
        response: params.response
          ? truncate(JSON.stringify(params.response), MAX_RESPONSE_LENGTH)
          : null,
        success: params.success,
        errorMessage: params.errorMessage || null,
        durationMs: params.durationMs,
      },
    });
  } catch (error) {
    // Don't fail the operation if logging fails
    console.error("[shopify-store-mcp] Failed to log operation:", error);
  }
}

/**
 * Query operation history
 */
export async function getOperationHistory(params: {
  storeDomain: string;
  toolName?: string;
  operationType?: "query" | "mutation";
  success?: boolean;
  since?: Date;
  limit?: number;
}): Promise<
  Array<{
    id: string;
    toolName: string;
    operationType: string;
    query: string;
    success: boolean;
    errorMessage: string | null;
    durationMs: number;
    createdAt: Date;
  }>
> {
  const where: Record<string, unknown> = {
    storeDomain: params.storeDomain,
  };

  if (params.toolName) {
    where.toolName = params.toolName;
  }

  if (params.operationType) {
    where.operationType = params.operationType;
  }

  if (params.success !== undefined) {
    where.success = params.success;
  }

  if (params.since) {
    where.createdAt = { gte: params.since };
  }

  return prisma.operationLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: params.limit || 50,
    select: {
      id: true,
      toolName: true,
      operationType: true,
      query: true,
      success: true,
      errorMessage: true,
      durationMs: true,
      createdAt: true,
    },
  });
}

/**
 * Get aggregated statistics
 */
export async function getOperationStats(params: {
  storeDomain: string;
  since: Date;
}): Promise<{
  totalCalls: number;
  successCount: number;
  errorCount: number;
  avgDurationMs: number;
  byTool: Record<
    string,
    { calls: number; successRate: number; avgDuration: number }
  >;
}> {
  // Get all operations in the period
  const operations = await prisma.operationLog.findMany({
    where: {
      storeDomain: params.storeDomain,
      createdAt: { gte: params.since },
    },
    select: {
      toolName: true,
      success: true,
      durationMs: true,
    },
  });

  if (operations.length === 0) {
    return {
      totalCalls: 0,
      successCount: 0,
      errorCount: 0,
      avgDurationMs: 0,
      byTool: {},
    };
  }

  const totalCalls = operations.length;
  const successCount = operations.filter((op) => op.success).length;
  const errorCount = totalCalls - successCount;
  const avgDurationMs =
    operations.reduce((sum, op) => sum + op.durationMs, 0) / totalCalls;

  // Group by tool
  const byTool: Record<
    string,
    { calls: number; successRate: number; avgDuration: number }
  > = {};

  const toolGroups = new Map<
    string,
    { total: number; success: number; duration: number }
  >();

  for (const op of operations) {
    const group = toolGroups.get(op.toolName) || {
      total: 0,
      success: 0,
      duration: 0,
    };
    group.total++;
    if (op.success) group.success++;
    group.duration += op.durationMs;
    toolGroups.set(op.toolName, group);
  }

  for (const [toolName, group] of toolGroups) {
    byTool[toolName] = {
      calls: group.total,
      successRate: group.success / group.total,
      avgDuration: group.duration / group.total,
    };
  }

  return {
    totalCalls,
    successCount,
    errorCount,
    avgDurationMs,
    byTool,
  };
}
