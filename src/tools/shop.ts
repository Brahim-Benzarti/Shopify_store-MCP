import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AdminApiClient } from "../shopify-client.js";
import {
  formatSuccessResponse,
  formatGraphQLErrors,
  formatErrorResponse,
} from "../errors.js";
import { GET_SHOP } from "../graphql/admin/index.js";

export function registerShopTools(
  server: McpServer,
  client: AdminApiClient
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
      try {
        const response = await client.request(GET_SHOP);

        if (response.errors) {
          return formatGraphQLErrors(response);
        }

        return formatSuccessResponse(response.data);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );
}
