import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AdminApiClient } from "../shopify-client.js";
import {
  formatSuccessResponse,
  formatGraphQLErrors,
  formatErrorResponse,
} from "../errors.js";
import { GET_SHOP } from "../graphql/admin/index.js";
import { enqueue } from "../queue.js";
import { logOperation } from "../logger.js";

export function registerShopTools(
  server: McpServer,
  client: AdminApiClient,
  storeDomain: string
): void {
  server.registerTool(
    "get_shop_info",
    {
      title: "Get Shop Info",
      description:
        "Retrieve the store's configuration and settings. Returns store name, email, domain, " +
        "Shopify plan details, primary domain, currency, weight unit, timezone, and billing address. " +
        "Use this to verify store connection or get store-wide settings.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      const startTime = Date.now();

      try {
        const response = await enqueue(() => client.request(GET_SHOP));

        if (response.errors) {
          await logOperation({
            storeDomain,
            toolName: "get_shop_info",
            query: GET_SHOP,
            success: false,
            errorMessage: "GraphQL errors",
            durationMs: Date.now() - startTime,
          });
          return formatGraphQLErrors(response);
        }

        await logOperation({
          storeDomain,
          toolName: "get_shop_info",
          query: GET_SHOP,
          response: response.data,
          success: true,
          durationMs: Date.now() - startTime,
        });

        return formatSuccessResponse(response.data);
      } catch (error) {
        await logOperation({
          storeDomain,
          toolName: "get_shop_info",
          query: GET_SHOP,
          success: false,
          errorMessage: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - startTime,
        });
        return formatErrorResponse(error);
      }
    }
  );
}
