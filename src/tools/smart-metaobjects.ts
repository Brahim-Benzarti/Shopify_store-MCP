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
  METAOBJECT_DELETE,
} from "../graphql/admin/index.js";
import { normalizeGid } from "../errors.js";
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

  // DELETE METAOBJECT
  server.registerTool(
    "delete_metaobject",
    {
      title: "Delete Metaobject",
      description:
        "Delete a metaobject by ID or by type+handle. " +
        "This is a destructive operation that cannot be undone.",
      inputSchema: {
        id: z
          .string()
          .optional()
          .describe(
            "Metaobject ID (GID or numeric). Either provide 'id' OR ('type' + 'handle')."
          ),
        type: z
          .string()
          .optional()
          .describe("Metaobject type (e.g., 'color_swatch'). Use with 'handle'."),
        handle: z
          .string()
          .optional()
          .describe("Metaobject handle. Use with 'type'."),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true, // Deleting already-deleted = no-op
        openWorldHint: false,
      },
    },
    async ({ id, type, handle }) => {
      const startTime = Date.now();

      // Validate input
      if (!id && (!type || !handle)) {
        return formatErrorResponse(
          "Either 'id' or both 'type' and 'handle' must be provided."
        );
      }

      try {
        let metaobjectId = id;

        // If type+handle provided, look up the ID first
        if (!metaobjectId && type && handle) {
          const lookupResponse = await enqueue(() =>
            client.request(GET_METAOBJECT_BY_HANDLE, {
              variables: {
                handle: { type, handle },
              },
            })
          );

          if (lookupResponse.errors) {
            return formatGraphQLErrors(lookupResponse);
          }

          const existing = (lookupResponse.data as {
            metaobjectByHandle: { id: string } | null;
          }).metaobjectByHandle;

          if (!existing) {
            // Already doesn't exist - return success (idempotent)
            return formatSuccessResponse({
              success: true,
              action: "not_found",
              message: `Metaobject ${type}/${handle} does not exist. Nothing to delete.`,
            });
          }

          metaobjectId = existing.id;
        }

        // Normalize the GID
        const gid = normalizeGid(metaobjectId!, "Metaobject");

        // Delete the metaobject
        const deleteResponse = await enqueue(() =>
          client.request(METAOBJECT_DELETE, {
            variables: { id: gid },
          })
        );

        if (deleteResponse.errors) {
          await logOperation({
            storeDomain,
            toolName: "delete_metaobject",
            query: METAOBJECT_DELETE,
            variables: { id: gid, type, handle },
            response: deleteResponse,
            success: false,
            errorMessage: "GraphQL errors",
            durationMs: Date.now() - startTime,
          });
          return formatGraphQLErrors(deleteResponse);
        }

        const deleteData = deleteResponse.data as {
          metaobjectDelete: {
            deletedId: string | null;
            userErrors: Array<{ field: string[] | null; message: string }>;
          };
        };

        if (deleteData.metaobjectDelete.userErrors.length > 0) {
          await logOperation({
            storeDomain,
            toolName: "delete_metaobject",
            query: METAOBJECT_DELETE,
            variables: { id: gid, type, handle },
            response: deleteResponse,
            success: false,
            errorMessage: deleteData.metaobjectDelete.userErrors.map(e => e.message).join(", "),
            durationMs: Date.now() - startTime,
          });
          return formatUserErrors(deleteData.metaobjectDelete.userErrors);
        }

        await logOperation({
          storeDomain,
          toolName: "delete_metaobject",
          query: METAOBJECT_DELETE,
          variables: { id: gid, type, handle },
          response: deleteResponse,
          success: true,
          durationMs: Date.now() - startTime,
        });

        return formatSuccessResponse({
          success: true,
          action: "deleted",
          deletedId: deleteData.metaobjectDelete.deletedId,
          message: `Metaobject deleted successfully.`,
        });
      } catch (error) {
        await logOperation({
          storeDomain,
          toolName: "delete_metaobject",
          query: METAOBJECT_DELETE,
          variables: { id, type, handle },
          success: false,
          errorMessage: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - startTime,
        });
        return formatErrorResponse(error);
      }
    }
  );
}
