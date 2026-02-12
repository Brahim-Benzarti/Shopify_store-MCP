/**
 * Infrastructure tools for configuration, history, and stats
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AdminApiClient } from "../shopify-client.js";
import {
  formatSuccessResponse,
  formatGraphQLErrors,
  formatErrorResponse,
} from "../errors.js";
import prisma from "../db.js";
import {
  updateQueue,
  detectTierFromPlan,
  getCurrentTierInfo,
  SHOPIFY_TIER_CONFIGS,
  type ShopifyTier,
} from "../queue.js";
import {
  getOperationHistory,
  getOperationStats,
  getSessionId,
} from "../logger.js";
import { GET_SHOP } from "../graphql/admin/index.js";
import { enqueue } from "../queue.js";

export function registerInfrastructureTools(
  server: McpServer,
  client: AdminApiClient,
  storeDomain: string
): void {
  // CONFIGURE
  server.registerTool(
    "configure",
    {
      title: "Configure MCP",
      description:
        "Configure the MCP server settings. " +
        "Set the rate limit tier manually or auto-detect from shop plan. " +
        "Returns current configuration including tier, queue settings, and session info.",
      inputSchema: {
        tier: z
          .enum(["STANDARD", "ADVANCED", "PLUS", "ENTERPRISE"])
          .optional()
          .describe(
            "Manually set the rate limit tier. " +
            "STANDARD: 1 req/sec (Basic, Development plans). " +
            "ADVANCED: 2 req/sec (Advanced plans). " +
            "PLUS: 5 req/sec (Shopify Plus). " +
            "ENTERPRISE: 10 req/sec (Commerce Components)."
          ),
        autoDetect: z
          .boolean()
          .optional()
          .describe(
            "Auto-detect tier from shop plan. " +
            "Queries the shop and sets tier based on plan name."
          ),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ tier, autoDetect }) => {
      try {
        let detectedTier: ShopifyTier | undefined;
        let shopPlan: string | undefined;
        let shopName: string | undefined;

        // Auto-detect from shop plan
        if (autoDetect) {
          const response = await enqueue(() => client.request(GET_SHOP, {}));

          if (response.errors) {
            return formatGraphQLErrors(response);
          }

          const shopData = response.data as {
            shop: {
              name: string;
              plan: {
                displayName: string;
                partnerDevelopment: boolean;
                shopifyPlus: boolean;
              };
            };
          };

          shopName = shopData.shop.name;
          shopPlan = shopData.shop.plan.displayName;
          detectedTier = detectTierFromPlan({
            shopifyPlus: shopData.shop.plan.shopifyPlus,
            displayName: shopData.shop.plan.displayName,
          });
        }

        // Use provided tier, or detected tier, or keep current
        const newTier = tier || detectedTier;

        if (newTier) {
          updateQueue(newTier);

          // Save to database
          await prisma.storeConfig.upsert({
            where: { storeDomain },
            update: {
              tier: newTier,
              autoDetected: !!autoDetect,
              shopName,
              shopPlan,
            },
            create: {
              storeDomain,
              tier: newTier,
              autoDetected: !!autoDetect,
              shopName,
              shopPlan,
            },
          });
        }

        // Get current config
        const currentTier = getCurrentTierInfo();
        const config = await prisma.storeConfig.findUnique({
          where: { storeDomain },
        });

        return formatSuccessResponse({
          success: true,
          config: {
            storeDomain,
            tier: currentTier.tier,
            tierConfig: currentTier.config,
            autoDetected: config?.autoDetected || false,
            shopName: config?.shopName || shopName,
            shopPlan: config?.shopPlan || shopPlan,
            sessionId: getSessionId(),
          },
          availableTiers: Object.keys(SHOPIFY_TIER_CONFIGS),
        });
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // GET HISTORY
  server.registerTool(
    "get_history",
    {
      title: "Get Operation History",
      description:
        "Query past operations for debugging. " +
        "Filter by tool name, operation type, success/failure, or date range. " +
        "Returns recent operations with query, response, duration, and errors.",
      inputSchema: {
        toolName: z
          .string()
          .optional()
          .describe("Filter by tool name (e.g., 'get_products', 'upload_file')"),
        operationType: z
          .enum(["query", "mutation"])
          .optional()
          .describe("Filter by operation type"),
        success: z
          .boolean()
          .optional()
          .describe("Filter by success (true) or failure (false)"),
        since: z
          .string()
          .optional()
          .describe("ISO date string. Only return operations after this date."),
        limit: z
          .number()
          .int()
          .min(1)
          .max(500)
          .default(50)
          .describe("Maximum number of operations to return (1-500). Default: 50"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ toolName, operationType, success, since, limit }) => {
      try {
        const operations = await getOperationHistory({
          storeDomain,
          toolName,
          operationType,
          success,
          since: since ? new Date(since) : undefined,
          limit,
        });

        return formatSuccessResponse({
          success: true,
          count: operations.length,
          operations,
        });
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );

  // GET STATS
  server.registerTool(
    "get_stats",
    {
      title: "Get Usage Statistics",
      description:
        "Get aggregated statistics for operations. " +
        "Includes total calls, success rate, average duration, and breakdown by tool.",
      inputSchema: {
        period: z
          .enum(["day", "week", "month"])
          .default("day")
          .describe("Time period for statistics. Default: day"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ period }) => {
      try {
        // Calculate since date based on period
        const since = new Date();
        switch (period) {
          case "day":
            since.setDate(since.getDate() - 1);
            break;
          case "week":
            since.setDate(since.getDate() - 7);
            break;
          case "month":
            since.setMonth(since.getMonth() - 1);
            break;
        }

        const stats = await getOperationStats({
          storeDomain,
          since,
        });

        return formatSuccessResponse({
          success: true,
          period,
          since: since.toISOString(),
          stats: {
            totalCalls: stats.totalCalls,
            successCount: stats.successCount,
            errorCount: stats.errorCount,
            successRate: stats.totalCalls > 0 ? stats.successCount / stats.totalCalls : 0,
            avgDurationMs: Math.round(stats.avgDurationMs),
            byTool: stats.byTool,
          },
        });
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );
}
