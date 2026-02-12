/**
 * Smart bulk operation tools
 * Handles bulk export and import with polling
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
  BULK_OPERATION_RUN_QUERY,
  GET_CURRENT_BULK_OPERATION,
  STAGED_UPLOADS_CREATE,
  BULK_OPERATION_RUN_MUTATION,
} from "../graphql/admin/index.js";
import { pollUntil } from "../utils/polling.js";
import { enqueue } from "../queue.js";
import { logOperation } from "../logger.js";

// Bulk operation status constants
const BULK_STATUS = {
  CREATED: "CREATED",
  RUNNING: "RUNNING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELED: "CANCELED",
  CANCELING: "CANCELING",
} as const;

export function registerSmartBulkTools(
  server: McpServer,
  client: AdminApiClient,
  storeDomain: string
): void {
  // BULK EXPORT
  server.registerTool(
    "bulk_export",
    {
      title: "Bulk Export Data",
      description:
        "Export large amounts of data from Shopify using bulk operations. " +
        "This is a SMART tool that: starts the bulk query, polls until complete, returns download URL. " +
        "Use this for exporting products, orders, customers, etc. in JSONL format. " +
        "The query should be the inner query WITHOUT the top-level 'query' keyword. " +
        "Example: { products { edges { node { id title } } } }",
      inputSchema: {
        query: z
          .string()
          .describe(
            "The GraphQL query to execute. Provide the inner query without 'query' keyword. " +
            "Example: { products { edges { node { id title handle status } } } }"
          ),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ query }) => {
      const startTime = Date.now();

      try {
        // Step 1: Start the bulk query
        const startResponse = await enqueue(() =>
          client.request(BULK_OPERATION_RUN_QUERY, {
            variables: { query },
          })
        );

        if (startResponse.errors) {
          await logOperation({
            storeDomain,
            toolName: "bulk_export",
            query: BULK_OPERATION_RUN_QUERY,
            variables: { query },
            response: startResponse,
            success: false,
            errorMessage: "GraphQL errors",
            durationMs: Date.now() - startTime,
          });
          return formatGraphQLErrors(startResponse);
        }

        const startData = startResponse.data as {
          bulkOperationRunQuery: {
            bulkOperation: { id: string; status: string } | null;
            userErrors: Array<{ field: string[]; message: string }>;
          };
        };

        if (startData.bulkOperationRunQuery.userErrors.length > 0) {
          await logOperation({
            storeDomain,
            toolName: "bulk_export",
            query: BULK_OPERATION_RUN_QUERY,
            variables: { query },
            response: startResponse,
            success: false,
            errorMessage: startData.bulkOperationRunQuery.userErrors.map(e => e.message).join(", "),
            durationMs: Date.now() - startTime,
          });
          return formatUserErrors(startData.bulkOperationRunQuery.userErrors);
        }

        const bulkOp = startData.bulkOperationRunQuery.bulkOperation;
        if (!bulkOp) {
          return formatErrorResponse("No bulk operation returned");
        }

        // Step 2: Poll until complete
        const result = await pollUntil(
          async () => {
            const statusResponse = await enqueue(() =>
              client.request(GET_CURRENT_BULK_OPERATION, {})
            );

            if (statusResponse.errors) {
              return { done: true, error: "Failed to check bulk operation status" };
            }

            const current = (statusResponse.data as {
              currentBulkOperation: {
                id: string;
                status: string;
                url: string | null;
                objectCount: number;
                errorCode: string | null;
              } | null;
            }).currentBulkOperation;

            if (!current || current.id !== bulkOp.id) {
              return { done: true, error: "Bulk operation not found or changed" };
            }

            if (current.status === BULK_STATUS.COMPLETED) {
              return {
                done: true,
                result: {
                  id: current.id,
                  status: "COMPLETED",
                  url: current.url,
                  objectCount: current.objectCount,
                },
              };
            }

            if (current.status === BULK_STATUS.FAILED) {
              return {
                done: true,
                error: `Bulk operation failed: ${current.errorCode || "Unknown error"}`,
              };
            }

            if (current.status === BULK_STATUS.CANCELED) {
              return { done: true, error: "Bulk operation was canceled" };
            }

            // Still running
            return { done: false };
          },
          {
            intervalMs: 5000, // Check every 5 seconds
            timeoutMs: 300000, // 5 minutes max
          }
        );

        await logOperation({
          storeDomain,
          toolName: "bulk_export",
          query: BULK_OPERATION_RUN_QUERY,
          variables: { query },
          response: result,
          success: true,
          durationMs: Date.now() - startTime,
        });

        return formatSuccessResponse({
          success: true,
          bulkOperation: result,
          message: `Bulk export completed. Download URL: ${result.url}`,
          downloadUrl: result.url,
        });
      } catch (error) {
        await logOperation({
          storeDomain,
          toolName: "bulk_export",
          query: BULK_OPERATION_RUN_QUERY,
          variables: { query },
          success: false,
          errorMessage: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - startTime,
        });
        return formatErrorResponse(error);
      }
    }
  );

  // BULK IMPORT
  server.registerTool(
    "bulk_import",
    {
      title: "Bulk Import Data",
      description:
        "Import large amounts of data to Shopify using bulk mutations. " +
        "This is a SMART tool that: creates staged upload, uploads JSONL, runs bulk mutation, polls until complete. " +
        "The mutation should be a single mutation that will run for each line in the JSONL. " +
        "The JSONL file should have one JSON object per line with the mutation variables.",
      inputSchema: {
        mutation: z
          .string()
          .describe(
            "The GraphQL mutation to execute per JSONL line. " +
            "Example: mutation productUpdate($input: ProductInput!) { productUpdate(input: $input) { product { id } userErrors { message } } }"
          ),
        jsonlContent: z
          .string()
          .describe(
            "The JSONL content to import. One JSON object per line with mutation variables. " +
            "Example: {\"input\": {\"id\": \"gid://shopify/Product/123\", \"title\": \"New Title\"}}"
          ),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ mutation, jsonlContent }) => {
      const startTime = Date.now();

      try {
        // Step 1: Create staged upload
        const filename = `bulk-import-${Date.now()}.jsonl`;
        const stagedResponse = await enqueue(() =>
          client.request(STAGED_UPLOADS_CREATE, {
            variables: {
              input: [
                {
                  filename,
                  mimeType: "text/jsonl",
                  httpMethod: "POST",
                  resource: "BULK_MUTATION_VARIABLES",
                },
              ],
            },
          })
        );

        if (stagedResponse.errors) {
          return formatGraphQLErrors(stagedResponse);
        }

        const stagedData = stagedResponse.data as {
          stagedUploadsCreate: {
            stagedTargets: Array<{
              url: string;
              resourceUrl: string;
              parameters: Array<{ name: string; value: string }>;
            }>;
            userErrors: Array<{ field: string[]; message: string }>;
          };
        };

        if (stagedData.stagedUploadsCreate.userErrors.length > 0) {
          return formatUserErrors(stagedData.stagedUploadsCreate.userErrors);
        }

        const target = stagedData.stagedUploadsCreate.stagedTargets[0];
        if (!target) {
          return formatErrorResponse("No staged upload target returned");
        }

        // Step 2: Upload JSONL to staged URL
        const formData = new FormData();
        for (const param of target.parameters) {
          formData.append(param.name, param.value);
        }
        formData.append("file", new Blob([jsonlContent], { type: "text/jsonl" }), filename);

        const uploadResponse = await fetch(target.url, {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          return formatErrorResponse(`Failed to upload JSONL: ${uploadResponse.statusText}`);
        }

        // Step 3: Run bulk mutation
        const bulkResponse = await enqueue(() =>
          client.request(BULK_OPERATION_RUN_MUTATION, {
            variables: {
              mutation,
              stagedUploadPath: target.resourceUrl,
            },
          })
        );

        if (bulkResponse.errors) {
          return formatGraphQLErrors(bulkResponse);
        }

        const bulkData = bulkResponse.data as {
          bulkOperationRunMutation: {
            bulkOperation: { id: string; status: string } | null;
            userErrors: Array<{ field: string[]; message: string }>;
          };
        };

        if (bulkData.bulkOperationRunMutation.userErrors.length > 0) {
          return formatUserErrors(bulkData.bulkOperationRunMutation.userErrors);
        }

        const bulkOp = bulkData.bulkOperationRunMutation.bulkOperation;
        if (!bulkOp) {
          return formatErrorResponse("No bulk operation returned");
        }

        // Step 4: Poll until complete
        const result = await pollUntil(
          async () => {
            const statusResponse = await enqueue(() =>
              client.request(GET_CURRENT_BULK_OPERATION, {})
            );

            if (statusResponse.errors) {
              return { done: true, error: "Failed to check bulk operation status" };
            }

            const current = (statusResponse.data as {
              currentBulkOperation: {
                id: string;
                status: string;
                objectCount: number;
                errorCode: string | null;
              } | null;
            }).currentBulkOperation;

            if (!current || current.id !== bulkOp.id) {
              return { done: true, error: "Bulk operation not found or changed" };
            }

            if (current.status === BULK_STATUS.COMPLETED) {
              return {
                done: true,
                result: {
                  id: current.id,
                  status: "COMPLETED",
                  objectCount: current.objectCount,
                },
              };
            }

            if (current.status === BULK_STATUS.FAILED) {
              return {
                done: true,
                error: `Bulk operation failed: ${current.errorCode || "Unknown error"}`,
              };
            }

            return { done: false };
          },
          {
            intervalMs: 5000,
            timeoutMs: 300000,
          }
        );

        await logOperation({
          storeDomain,
          toolName: "bulk_import",
          query: BULK_OPERATION_RUN_MUTATION,
          variables: { mutation, jsonlLines: jsonlContent.split("\n").length },
          response: result,
          success: true,
          durationMs: Date.now() - startTime,
        });

        return formatSuccessResponse({
          success: true,
          bulkOperation: result,
          message: `Bulk import completed. ${result.objectCount} objects processed.`,
        });
      } catch (error) {
        await logOperation({
          storeDomain,
          toolName: "bulk_import",
          query: BULK_OPERATION_RUN_MUTATION,
          variables: { mutation },
          success: false,
          errorMessage: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - startTime,
        });
        return formatErrorResponse(error);
      }
    }
  );
}
