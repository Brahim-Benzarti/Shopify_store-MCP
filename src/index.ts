#!/usr/bin/env node

// Set default DATABASE_URL before any imports that use Prisma
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync, mkdirSync } from "fs";
import { homedir } from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default to a database file in ~/.shopify-mcp/ directory
if (!process.env.DATABASE_URL) {
  const dbDir = join(homedir(), ".shopify-mcp");
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }
  process.env.DATABASE_URL = `file:${join(dbDir, "mcp.db")}`;
}

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { getAdminClient } from "./shopify-client.js";
import { registerAllTools } from "./tools/index.js";
import { registerAllPrompts } from "./prompts/index.js";
import { registerAllResources } from "./resources/index.js";
// Database and queue
import prisma, { initializeDatabase, cleanupOldLogs } from "./db.js";
import { updateQueue, getCurrentTierInfo, type ShopifyTier } from "./queue.js";
import { getSessionId } from "./logger.js";

async function main(): Promise<void> {
  const config = loadConfig();

  // Initialize database
  await initializeDatabase();

  // Load stored config and set up queue
  const storedConfig = await prisma.storeConfig.findUnique({
    where: { storeDomain: config.storeDomain },
  });

  // Use stored tier, env var, or default to STANDARD
  const tier: ShopifyTier =
    (storedConfig?.tier as ShopifyTier) ||
    (process.env.SHOPIFY_TIER as ShopifyTier) ||
    "STANDARD";
  updateQueue(tier);

  // Clean up old logs if configured
  const retentionDays = parseInt(process.env.MCP_LOG_RETENTION_DAYS || "30", 10);
  if (retentionDays > 0) {
    const deleted = await cleanupOldLogs(retentionDays);
    if (deleted > 0) {
      console.error(`[shopify-store-mcp] Cleaned up ${deleted} old log entries`);
    }
  }

  const adminClient = getAdminClient(config);

  // Verify API connection on startup
  try {
    const healthCheck = await adminClient.request(`query { shop { name } }`);
    if (healthCheck.errors) {
      const errObj = healthCheck.errors as Record<string, unknown>;
      if (errObj.networkStatusCode === 401) {
        console.error(`[shopify-store-mcp] ERROR: Invalid access token. Check SHOPIFY_ACCESS_TOKEN.`);
        console.error(`[shopify-store-mcp] Make sure the token belongs to store: ${config.storeDomain}`);
      } else if (errObj.networkStatusCode === 403) {
        console.error(`[shopify-store-mcp] ERROR: Token lacks required scopes.`);
      } else {
        console.error(`[shopify-store-mcp] ERROR: API connection failed:`, healthCheck.errors);
      }
      process.exit(1);
    }
    const shopName = (healthCheck.data as { shop: { name: string } })?.shop?.name;
    console.error(`[shopify-store-mcp] API connection verified: ${shopName}`);
  } catch (error) {
    console.error(`[shopify-store-mcp] ERROR: Failed to connect to Shopify API:`, error);
    process.exit(1);
  }

  const server = new McpServer({
    name: "shopify-store-mcp",
    version: "1.0.0",
  });

  // Register all capabilities
  registerAllTools(server, adminClient, config.storeDomain);
  registerAllPrompts(server);
  registerAllResources(server, config);

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log startup info
  const tierInfo = getCurrentTierInfo();
  console.error(`[shopify-store-mcp] Connected to store: ${config.storeDomain}`);
  console.error(`[shopify-store-mcp] API version: ${config.apiVersion}`);
  console.error(`[shopify-store-mcp] Rate limit tier: ${tierInfo.tier} (${tierInfo.config.intervalCap} req/sec)`);
  console.error(`[shopify-store-mcp] Session ID: ${getSessionId()}`);
  console.error(`[shopify-store-mcp] Tools: 10 (run 'schema_discover' to explore store schema)`);
}

main().catch((error) => {
  console.error("[shopify-store-mcp] Fatal error:", error);
  process.exit(1);
});
