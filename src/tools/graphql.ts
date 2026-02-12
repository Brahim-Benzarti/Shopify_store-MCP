import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AdminApiClient } from "../shopify-client.js";
import {
  formatSuccessResponse,
  formatGraphQLErrors,
  formatErrorResponse,
} from "../errors.js";

export function registerGraphQLTools(
  server: McpServer,
  client: AdminApiClient
): void {
  server.registerTool(
    "run_graphql_query",
    {
      title: "Run GraphQL Query",
      description:
        "Execute any GraphQL query or mutation against the Shopify Admin API. " +
        "This is the most powerful and flexible tool - use it when other specialized tools " +
        "don't cover your use case, or when you need precise control over the query shape. " +
        "Returns the raw API response including data and any errors. " +
        "Refer to Shopify's Admin API GraphQL reference for available queries and mutations.",
      inputSchema: {
        query: z
          .string()
          .describe(
            "The GraphQL query or mutation string. Must be valid GraphQL syntax. " +
            "Example: 'query { shop { name } }'"
          ),
        variables: z
          .record(z.unknown())
          .optional()
          .describe(
            "Variables to pass to the GraphQL operation as a JSON object. " +
            "Keys should match the variable names in your query (without the $ prefix)."
          ),
      },
      annotations: {
        // Cannot determine if read-only since it could be a mutation
        openWorldHint: true,
      },
    },
    async ({ query, variables }) => {
      try {
        const response = await client.request(query, {
          variables: variables as Record<string, unknown>,
        });

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
