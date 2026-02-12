/**
 * Smart metaobject tools
 * Handles upsert (get or create/update) in one operation
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AdminApiClient } from "../shopify-client.js";
import {
  formatSuccessResponse,
  formatGraphQLErrors,
  formatErrorResponse,
  formatUserErrors,
} from "../errors.js";
import {
  GET_METAOBJECT_BY_HANDLE,
  METAOBJECT_CREATE,
  METAOBJECT_UPDATE,
} from "../graphql/admin/index.js";
import { enqueue } from "../queue.js";
import { logOperation } from "../logger.js";

export function registerSmartMetaobjectTools(
  server: McpServer,
  client: AdminApiClient,
  storeDomain: string
): void {
  server.registerTool(
    "upsert_metaobject",
    {
      title: "Upsert Metaobject",
      description:
        "Create or update a metaobject by handle (idempotent). " +
        "This is a SMART tool that: checks if metaobject exists → creates if not → updates if exists. " +
        "Use this when you want to ensure a metaobject exists with certain data, " +
        "regardless of whether it already exists. " +
        "The handle must be unique within the metaobject type.",
      inputSchema: {
        type: z
          .string()
          .describe(
            "The metaobject type (e.g., 'color_swatch', 'brand', 'faq'). " +
            "Must match an existing metaobject definition in the store."
          ),
        handle: z
          .string()
          .describe(
            "Unique handle for this metaobject within its type. " +
            "Used to identify the metaobject for upsert."
          ),
        fields: z
          .array(
            z.object({
              key: z.string().describe("Field key as defined in the metaobject definition"),
              value: z.string().describe("Field value (JSON string for complex types)"),
            })
          )
          .describe("Array of field key-value pairs to set on the metaobject"),
        publishStatus: z
          .enum(["ACTIVE", "DRAFT"])
          .default("ACTIVE")
          .describe("Publish status. ACTIVE makes it visible on storefront if publishable."),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true, // Same input = same result
        openWorldHint: false,
      },
    },
    async ({ type, handle, fields, publishStatus }) => {
      const startTime = Date.now();

      try {
        // Step 1: Check if metaobject already exists
        const existingResponse = await enqueue(() =>
          client.request(GET_METAOBJECT_BY_HANDLE, {
            variables: {
              handle: { type, handle },
            },
          })
        );

        if (existingResponse.errors) {
          await logOperation({
            storeDomain,
            toolName: "upsert_metaobject",
            query: GET_METAOBJECT_BY_HANDLE,
            variables: { type, handle },
            response: existingResponse,
            success: false,
            errorMessage: "GraphQL errors checking existing",
            durationMs: Date.now() - startTime,
          });
          return formatGraphQLErrors(existingResponse);
        }

        const existing = (existingResponse.data as {
          metaobjectByHandle: { id: string } | null;
        }).metaobjectByHandle;

        let result;
        let action: "created" | "updated";

        if (existing) {
          // Step 2a: Update existing metaobject
          action = "updated";
          const updateResponse = await enqueue(() =>
            client.request(METAOBJECT_UPDATE, {
              variables: {
                id: existing.id,
                metaobject: {
                  fields,
                  capabilities: publishStatus
                    ? { publishable: { status: publishStatus } }
                    : undefined,
                },
              },
            })
          );

          if (updateResponse.errors) {
            await logOperation({
              storeDomain,
              toolName: "upsert_metaobject",
              query: METAOBJECT_UPDATE,
              variables: { id: existing.id, fields },
              response: updateResponse,
              success: false,
              errorMessage: "GraphQL errors during update",
              durationMs: Date.now() - startTime,
            });
            return formatGraphQLErrors(updateResponse);
          }

          const updateData = updateResponse.data as {
            metaobjectUpdate: {
              metaobject: unknown;
              userErrors: Array<{ field: string[]; message: string }>;
            };
          };

          if (updateData.metaobjectUpdate.userErrors.length > 0) {
            await logOperation({
              storeDomain,
              toolName: "upsert_metaobject",
              query: METAOBJECT_UPDATE,
              variables: { id: existing.id, fields },
              response: updateResponse,
              success: false,
              errorMessage: updateData.metaobjectUpdate.userErrors.map(e => e.message).join(", "),
              durationMs: Date.now() - startTime,
            });
            return formatUserErrors(updateData.metaobjectUpdate.userErrors);
          }

          result = updateData.metaobjectUpdate.metaobject;
        } else {
          // Step 2b: Create new metaobject
          action = "created";
          const createResponse = await enqueue(() =>
            client.request(METAOBJECT_CREATE, {
              variables: {
                metaobject: {
                  type,
                  handle,
                  fields,
                  capabilities: publishStatus
                    ? { publishable: { status: publishStatus } }
                    : undefined,
                },
              },
            })
          );

          if (createResponse.errors) {
            await logOperation({
              storeDomain,
              toolName: "upsert_metaobject",
              query: METAOBJECT_CREATE,
              variables: { type, handle, fields },
              response: createResponse,
              success: false,
              errorMessage: "GraphQL errors during create",
              durationMs: Date.now() - startTime,
            });
            return formatGraphQLErrors(createResponse);
          }

          const createData = createResponse.data as {
            metaobjectCreate: {
              metaobject: unknown;
              userErrors: Array<{ field: string[]; message: string }>;
            };
          };

          if (createData.metaobjectCreate.userErrors.length > 0) {
            await logOperation({
              storeDomain,
              toolName: "upsert_metaobject",
              query: METAOBJECT_CREATE,
              variables: { type, handle, fields },
              response: createResponse,
              success: false,
              errorMessage: createData.metaobjectCreate.userErrors.map(e => e.message).join(", "),
              durationMs: Date.now() - startTime,
            });
            return formatUserErrors(createData.metaobjectCreate.userErrors);
          }

          result = createData.metaobjectCreate.metaobject;
        }

        await logOperation({
          storeDomain,
          toolName: "upsert_metaobject",
          query: action === "created" ? METAOBJECT_CREATE : METAOBJECT_UPDATE,
          variables: { type, handle, fields },
          response: result,
          success: true,
          durationMs: Date.now() - startTime,
        });

        return formatSuccessResponse({
          success: true,
          action,
          metaobject: result,
          message: `Metaobject ${action} successfully.`,
        });
      } catch (error) {
        await logOperation({
          storeDomain,
          toolName: "upsert_metaobject",
          query: "upsert_metaobject",
          variables: { type, handle, fields },
          success: false,
          errorMessage: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - startTime,
        });
        return formatErrorResponse(error);
      }
    }
  );
}
