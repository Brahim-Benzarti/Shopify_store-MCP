/**
 * Smart schema discovery tool
 * Combines metafield definitions and metaobject definitions in one call
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AdminApiClient } from "../shopify-client.js";
import {
  formatSuccessResponse,
  formatGraphQLErrors,
  formatErrorResponse,
} from "../errors.js";
import {
  GET_METAFIELD_DEFINITIONS,
  GET_METAOBJECT_DEFINITIONS,
} from "../graphql/admin/index.js";
import { enqueue } from "../queue.js";
import { logOperation } from "../logger.js";

// Valid metafield owner types
const METAFIELD_OWNER_TYPES = [
  "PRODUCT",
  "PRODUCTVARIANT",
  "COLLECTION",
  "CUSTOMER",
  "ORDER",
  "DRAFTORDER",
  "SHOP",
  "COMPANY",
  "LOCATION",
  "MARKET",
  "PAGE",
  "BLOG",
  "ARTICLE",
  "DISCOUNT",
] as const;

export function registerSmartSchemaTools(
  server: McpServer,
  client: AdminApiClient,
  storeDomain: string
): void {
  server.registerTool(
    "schema_discover",
    {
      title: "Discover Store Schema",
      description:
        "Discover custom schema in the store: metafield definitions and metaobject types. " +
        "This is a SMART tool that combines multiple discovery queries in one call. " +
        "Use this to understand what custom fields and data types are available in the store " +
        "before working with metafields or metaobjects.",
      inputSchema: {
        includeMetafields: z
          .boolean()
          .default(true)
          .describe("Include metafield definitions in the response"),
        includeMetaobjects: z
          .boolean()
          .default(true)
          .describe("Include metaobject definitions in the response"),
        metafieldOwnerTypes: z
          .array(z.enum(METAFIELD_OWNER_TYPES))
          .optional()
          .describe(
            "Filter metafield definitions by owner type(s). " +
            "If not provided, fetches definitions for PRODUCT, CUSTOMER, ORDER, and SHOP."
          ),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ includeMetafields, includeMetaobjects, metafieldOwnerTypes }) => {
      const startTime = Date.now();

      try {
        const result: {
          metafieldDefinitions?: Record<string, unknown[]>;
          metaobjectDefinitions?: unknown[];
        } = {};

        // Fetch metafield definitions
        if (includeMetafields) {
          const ownerTypes = metafieldOwnerTypes || ["PRODUCT", "CUSTOMER", "ORDER", "SHOP"];
          const metafieldDefs: Record<string, unknown[]> = {};

          for (const ownerType of ownerTypes) {
            const response = await enqueue(() =>
              client.request(GET_METAFIELD_DEFINITIONS, {
                variables: {
                  ownerType,
                  first: 100,
                },
              })
            );

            if (response.errors) {
              console.error(`[schema_discover] Error fetching metafield definitions for ${ownerType}:`, response.errors);
              continue;
            }

            const data = response.data as {
              metafieldDefinitions: {
                edges: Array<{ node: unknown }>;
              };
            };

            metafieldDefs[ownerType] = data.metafieldDefinitions.edges.map(
              (edge) => edge.node
            );
          }

          result.metafieldDefinitions = metafieldDefs;
        }

        // Fetch metaobject definitions
        if (includeMetaobjects) {
          const response = await enqueue(() =>
            client.request(GET_METAOBJECT_DEFINITIONS, {
              variables: { first: 100 },
            })
          );

          if (response.errors) {
            await logOperation({
              storeDomain,
              toolName: "schema_discover",
              query: GET_METAOBJECT_DEFINITIONS,
              variables: {},
              response,
              success: false,
              errorMessage: "GraphQL errors fetching metaobject definitions",
              durationMs: Date.now() - startTime,
            });
            return formatGraphQLErrors(response);
          }

          const data = response.data as {
            metaobjectDefinitions: {
              edges: Array<{ node: unknown }>;
            };
          };

          result.metaobjectDefinitions = data.metaobjectDefinitions.edges.map(
            (edge) => edge.node
          );
        }

        // Build summary
        const summary: string[] = [];

        if (result.metafieldDefinitions) {
          const totalDefs = Object.values(result.metafieldDefinitions).reduce(
            (sum, defs) => sum + defs.length,
            0
          );
          summary.push(`${totalDefs} metafield definitions across ${Object.keys(result.metafieldDefinitions).length} owner types`);
        }

        if (result.metaobjectDefinitions) {
          summary.push(`${result.metaobjectDefinitions.length} metaobject types`);
        }

        await logOperation({
          storeDomain,
          toolName: "schema_discover",
          query: "schema_discover",
          variables: { includeMetafields, includeMetaobjects, metafieldOwnerTypes },
          response: { summary },
          success: true,
          durationMs: Date.now() - startTime,
        });

        return formatSuccessResponse({
          success: true,
          summary: summary.join(", "),
          ...result,
        });
      } catch (error) {
        await logOperation({
          storeDomain,
          toolName: "schema_discover",
          query: "schema_discover",
          variables: { includeMetafields, includeMetaobjects, metafieldOwnerTypes },
          success: false,
          errorMessage: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - startTime,
        });
        return formatErrorResponse(error);
      }
    }
  );
}
