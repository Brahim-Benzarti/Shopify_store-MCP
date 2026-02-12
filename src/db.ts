/**
 * Prisma client singleton for SQLite database
 * Handles operation logging, store configuration, and background jobs
 */

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

// Create Prisma client with optimized settings
const createPrismaClient = () =>
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

// Use global singleton in development to prevent multiple instances during hot reload
if (process.env.NODE_ENV !== "production") {
  if (!global.prismaGlobal) {
    global.prismaGlobal = createPrismaClient();
  }
}

const prisma = global.prismaGlobal ?? createPrismaClient();

// Graceful shutdown handling
const gracefulShutdown = () => {
  prisma
    .$disconnect()
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

export default prisma;

/**
 * Initialize the database (create tables if they don't exist)
 * This is called on MCP server startup
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await prisma.$connect();

    // Test if tables exist by trying a simple query
    // If tables don't exist, this will fail and we'll create them
    try {
      await prisma.storeConfig.count();
      console.error("[shopify-store-mcp] Database connected");
    } catch (tableError) {
      // Tables don't exist - this is expected on first run
      // Prisma will create them on first write
      console.error("[shopify-store-mcp] Database initializing (first run)...");

      // Create a dummy record to trigger table creation, then delete it
      // This is a workaround since Prisma SQLite doesn't auto-create tables
      try {
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "StoreConfig" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "storeDomain" TEXT NOT NULL,
            "tier" TEXT NOT NULL DEFAULT 'STANDARD',
            "autoDetected" BOOLEAN NOT NULL DEFAULT false,
            "shopName" TEXT,
            "shopPlan" TEXT,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL
          )
        `;
        await prisma.$executeRaw`
          CREATE UNIQUE INDEX IF NOT EXISTS "StoreConfig_storeDomain_key" ON "StoreConfig"("storeDomain")
        `;
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "OperationLog" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "storeDomain" TEXT NOT NULL,
            "sessionId" TEXT NOT NULL,
            "toolName" TEXT NOT NULL,
            "operationType" TEXT NOT NULL,
            "query" TEXT NOT NULL,
            "variables" TEXT,
            "response" TEXT,
            "success" BOOLEAN NOT NULL,
            "errorMessage" TEXT,
            "durationMs" INTEGER NOT NULL,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `;
        await prisma.$executeRaw`
          CREATE INDEX IF NOT EXISTS "OperationLog_storeDomain_idx" ON "OperationLog"("storeDomain")
        `;
        await prisma.$executeRaw`
          CREATE INDEX IF NOT EXISTS "OperationLog_storeDomain_createdAt_idx" ON "OperationLog"("storeDomain", "createdAt")
        `;
        await prisma.$executeRaw`
          CREATE INDEX IF NOT EXISTS "OperationLog_toolName_idx" ON "OperationLog"("toolName")
        `;
        await prisma.$executeRaw`
          CREATE INDEX IF NOT EXISTS "OperationLog_sessionId_idx" ON "OperationLog"("sessionId")
        `;
        await prisma.$executeRaw`
          CREATE INDEX IF NOT EXISTS "OperationLog_createdAt_idx" ON "OperationLog"("createdAt")
        `;
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "BackgroundJob" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "storeDomain" TEXT NOT NULL,
            "sessionId" TEXT NOT NULL,
            "bulkOperationId" TEXT,
            "type" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'PENDING',
            "progress" REAL NOT NULL DEFAULT 0,
            "total" INTEGER NOT NULL DEFAULT 0,
            "processed" INTEGER NOT NULL DEFAULT 0,
            "data" TEXT,
            "result" TEXT,
            "error" TEXT,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL
          )
        `;
        await prisma.$executeRaw`
          CREATE INDEX IF NOT EXISTS "BackgroundJob_storeDomain_idx" ON "BackgroundJob"("storeDomain")
        `;
        await prisma.$executeRaw`
          CREATE INDEX IF NOT EXISTS "BackgroundJob_storeDomain_status_idx" ON "BackgroundJob"("storeDomain", "status")
        `;
        await prisma.$executeRaw`
          CREATE INDEX IF NOT EXISTS "BackgroundJob_bulkOperationId_idx" ON "BackgroundJob"("bulkOperationId")
        `;
        await prisma.$executeRaw`
          CREATE INDEX IF NOT EXISTS "BackgroundJob_status_idx" ON "BackgroundJob"("status")
        `;
        await prisma.$executeRaw`
          CREATE INDEX IF NOT EXISTS "BackgroundJob_sessionId_idx" ON "BackgroundJob"("sessionId")
        `;
        console.error("[shopify-store-mcp] Database tables created");
      } catch (createError) {
        console.error("[shopify-store-mcp] Failed to create tables:", createError);
        throw createError;
      }
    }
  } catch (error) {
    console.error("[shopify-store-mcp] Database connection failed:", error);
    throw error;
  }
}

/**
 * Clean up old operation logs based on retention period
 */
export async function cleanupOldLogs(retentionDays: number): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const result = await prisma.operationLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  });

  return result.count;
}
