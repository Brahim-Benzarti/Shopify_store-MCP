/**
 * Smart file upload tool
 * Handles the full workflow: create file → poll status → return ready URL
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
import { FILE_CREATE, GET_FILE } from "../graphql/admin/index.js";
import { pollUntil } from "../utils/polling.js";
import { enqueue } from "../queue.js";
import { logOperation } from "../logger.js";

// File status constants
const FILE_STATUS = {
  PROCESSING: "PROCESSING",
  READY: "READY",
  FAILED: "FAILED",
  UPLOADED: "UPLOADED",
} as const;

export function registerSmartFileTools(
  server: McpServer,
  client: AdminApiClient,
  storeDomain: string
): void {
  server.registerTool(
    "upload_file",
    {
      title: "Upload File",
      description:
        "Upload a file to Shopify from an external URL. " +
        "This is a SMART tool that handles the full workflow: " +
        "creates the file, polls until it's ready, and returns the final CDN URL. " +
        "Supports images, videos, and generic files. " +
        "Use this instead of raw fileCreate when you need the final URL immediately.",
      inputSchema: {
        url: z
          .string()
          .url()
          .describe("The external URL of the file to upload. Shopify will fetch this."),
        filename: z
          .string()
          .optional()
          .describe("Optional filename. If not provided, extracted from URL."),
        alt: z
          .string()
          .optional()
          .describe("Alt text for images. Recommended for accessibility."),
        contentType: z
          .enum(["IMAGE", "VIDEO", "FILE"])
          .optional()
          .describe(
            "Content type hint. IMAGE for images, VIDEO for videos, FILE for documents/other. " +
            "If not provided, Shopify will auto-detect."
          ),
        duplicateResolution: z
          .enum(["APPEND_UUID", "REPLACE", "RAISE_ERROR"])
          .default("APPEND_UUID")
          .describe(
            "How to handle duplicate filenames: " +
            "APPEND_UUID (default) adds unique suffix, " +
            "REPLACE overwrites existing, " +
            "RAISE_ERROR fails if exists."
          ),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ url, filename, alt, contentType, duplicateResolution }) => {
      const startTime = Date.now();

      try {
        // Step 1: Create the file
        const createResponse = await enqueue(() =>
          client.request(FILE_CREATE, {
            variables: {
              files: [
                {
                  originalSource: url,
                  filename: filename || undefined,
                  alt: alt || undefined,
                  contentType: contentType || undefined,
                  duplicateResolutionMode: duplicateResolution,
                },
              ],
            },
          })
        );

        if (createResponse.errors) {
          await logOperation({
            storeDomain,
            toolName: "upload_file",
            query: FILE_CREATE,
            variables: { url, filename, alt, contentType, duplicateResolution },
            response: createResponse,
            success: false,
            errorMessage: "GraphQL errors",
            durationMs: Date.now() - startTime,
          });
          return formatGraphQLErrors(createResponse);
        }

        const createData = createResponse.data as {
          fileCreate: {
            files: Array<{ id: string; fileStatus: string; fileErrors?: Array<{ message: string }> }>;
            userErrors: Array<{ field: string[]; message: string }>;
          };
        };

        if (createData.fileCreate.userErrors.length > 0) {
          await logOperation({
            storeDomain,
            toolName: "upload_file",
            query: FILE_CREATE,
            variables: { url, filename, alt, contentType, duplicateResolution },
            response: createResponse,
            success: false,
            errorMessage: createData.fileCreate.userErrors.map(e => e.message).join(", "),
            durationMs: Date.now() - startTime,
          });
          return formatUserErrors(createData.fileCreate.userErrors);
        }

        const createdFile = createData.fileCreate.files[0];
        if (!createdFile) {
          return formatErrorResponse("No file returned from fileCreate");
        }

        // Step 2: Poll until file is ready (or failed)
        const fileId = createdFile.id;

        const readyFile = await pollUntil(
          async () => {
            const statusResponse = await enqueue(() =>
              client.request(GET_FILE, { variables: { id: fileId } })
            );

            if (statusResponse.errors) {
              return { done: true, error: "Failed to check file status" };
            }

            const node = (statusResponse.data as { node: unknown }).node as {
              fileStatus: string;
              url?: string;
              image?: { url: string };
              originalSource?: { url: string };
              fileErrors?: Array<{ message: string }>;
            };

            if (!node) {
              return { done: true, error: "File not found" };
            }

            if (node.fileStatus === FILE_STATUS.READY) {
              // Extract the final URL based on file type
              const finalUrl = node.url || node.image?.url || node.originalSource?.url;
              return {
                done: true,
                result: {
                  id: fileId,
                  status: "READY",
                  url: finalUrl,
                  ...node,
                },
              };
            }

            if (node.fileStatus === FILE_STATUS.FAILED) {
              const errorMsg = node.fileErrors?.map(e => e.message).join(", ") || "File processing failed";
              return { done: true, error: errorMsg };
            }

            // Still processing
            return { done: false };
          },
          {
            intervalMs: 2000,
            timeoutMs: 60000, // 60 seconds max
          }
        );

        await logOperation({
          storeDomain,
          toolName: "upload_file",
          query: FILE_CREATE,
          variables: { url, filename, alt, contentType, duplicateResolution },
          response: readyFile,
          success: true,
          durationMs: Date.now() - startTime,
        });

        return formatSuccessResponse({
          success: true,
          file: readyFile,
          message: `File uploaded successfully. CDN URL: ${readyFile.url}`,
        });
      } catch (error) {
        await logOperation({
          storeDomain,
          toolName: "upload_file",
          query: FILE_CREATE,
          variables: { url, filename, alt, contentType, duplicateResolution },
          success: false,
          errorMessage: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - startTime,
        });
        return formatErrorResponse(error);
      }
    }
  );
}
