/**
 * Smart file upload tool
 * Handles the full workflow: create file → poll status → return ready URL
 * Supports both external URLs and direct file content (via staged uploads)
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
import { STAGED_UPLOADS_CREATE } from "../graphql/admin/index.js";
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

// Staged upload resource types
const STAGED_UPLOAD_RESOURCES = {
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  FILE: "FILE",
  MODEL_3D: "MODEL_3D",
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
        "Upload a file to Shopify. Supports TWO modes:\n\n" +
        "1. **External URL mode**: Provide `url` - Shopify fetches the file from the URL.\n" +
        "2. **Direct content mode**: Provide `content` (base64) + `filename` + `mimeType` - " +
        "Uses staged upload to upload file content directly.\n\n" +
        "This is a SMART tool that handles the full workflow: " +
        "creates the file, polls until ready, and returns the final CDN URL.",
      inputSchema: {
        url: z
          .string()
          .url()
          .optional()
          .describe(
            "External URL for Shopify to fetch. Use this for publicly accessible files. " +
            "Either provide `url` OR (`content` + `filename` + `mimeType`)."
          ),
        content: z
          .string()
          .optional()
          .describe(
            "Base64-encoded file content. Use this for direct file uploads. " +
            "Requires `filename` and `mimeType` to be provided."
          ),
        filename: z
          .string()
          .optional()
          .describe(
            "Filename with extension (e.g., 'image.jpg', 'document.pdf'). " +
            "Required for content mode, optional for URL mode."
          ),
        mimeType: z
          .string()
          .optional()
          .describe(
            "MIME type (e.g., 'image/jpeg', 'image/png', 'application/pdf'). " +
            "Required for content mode."
          ),
        alt: z
          .string()
          .optional()
          .describe("Alt text for images. Recommended for accessibility."),
        contentType: z
          .enum(["IMAGE", "VIDEO", "FILE"])
          .optional()
          .describe(
            "Content type hint. IMAGE for images, VIDEO for videos, FILE for documents/other. " +
            "If not provided, auto-detected from mimeType or filename."
          ),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ url, content, filename, mimeType, alt, contentType }) => {
      const startTime = Date.now();

      // Validate input - must have either URL or content
      if (!url && !content) {
        return formatErrorResponse(
          "Either 'url' (external URL) or 'content' (base64 data) must be provided."
        );
      }

      if (content && (!filename || !mimeType)) {
        return formatErrorResponse(
          "When providing 'content', both 'filename' and 'mimeType' are required."
        );
      }

      try {
        let fileInput: {
          originalSource?: string;
          filename?: string;
          alt?: string;
          contentType?: string;
        };

        // Mode 1: External URL
        if (url) {
          fileInput = {
            originalSource: url,
            filename: filename || undefined,
            alt: alt || undefined,
            contentType: contentType || undefined,
          };
        }
        // Mode 2: Staged upload with direct content
        else if (content && filename && mimeType) {
          // Step 1: Create staged upload target
          const resource = detectResourceType(mimeType, contentType);

          const stagedResponse = await enqueue(() =>
            client.request(STAGED_UPLOADS_CREATE, {
              variables: {
                input: [
                  {
                    filename,
                    mimeType,
                    httpMethod: "POST",
                    resource,
                    fileSize: Buffer.from(content, "base64").length.toString(),
                  },
                ],
              },
            })
          );

          if (stagedResponse.errors) {
            await logOperation({
              storeDomain,
              toolName: "upload_file",
              query: STAGED_UPLOADS_CREATE,
              variables: { filename, mimeType, resource },
              response: stagedResponse,
              success: false,
              errorMessage: "GraphQL errors creating staged upload",
              durationMs: Date.now() - startTime,
            });
            return formatGraphQLErrors(stagedResponse);
          }

          const stagedData = stagedResponse.data as {
            stagedUploadsCreate: {
              stagedTargets: Array<{
                url: string;
                resourceUrl: string;
                parameters: Array<{ name: string; value: string }>;
              }>;
              userErrors: Array<{ field: string[] | null; message: string }>;
            };
          };

          if (stagedData.stagedUploadsCreate.userErrors.length > 0) {
            return formatUserErrors(stagedData.stagedUploadsCreate.userErrors);
          }

          const target = stagedData.stagedUploadsCreate.stagedTargets[0];
          if (!target) {
            return formatErrorResponse("No staged upload target returned");
          }

          // Step 2: Upload content to staged URL
          const fileBuffer = Buffer.from(content, "base64");
          const formData = new FormData();

          for (const param of target.parameters) {
            formData.append(param.name, param.value);
          }
          formData.append("file", new Blob([fileBuffer], { type: mimeType }), filename);

          const uploadResponse = await fetch(target.url, {
            method: "POST",
            body: formData,
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            return formatErrorResponse(
              `Failed to upload to staged URL: ${uploadResponse.status} ${uploadResponse.statusText}. ${errorText}`
            );
          }

          // Use the staged upload resourceUrl as the source
          fileInput = {
            originalSource: target.resourceUrl,
            filename,
            alt: alt || undefined,
            contentType: contentType || detectContentType(mimeType),
          };
        } else {
          return formatErrorResponse("Invalid input combination");
        }

        // Step 3: Create the file in Shopify
        const createResponse = await enqueue(() =>
          client.request(FILE_CREATE, {
            variables: {
              files: [fileInput],
            },
          })
        );

        if (createResponse.errors) {
          await logOperation({
            storeDomain,
            toolName: "upload_file",
            query: FILE_CREATE,
            variables: { url, filename, alt, contentType, hasContent: !!content },
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
            userErrors: Array<{ field: string[] | null; message: string }>;
          };
        };

        if (createData.fileCreate.userErrors.length > 0) {
          await logOperation({
            storeDomain,
            toolName: "upload_file",
            query: FILE_CREATE,
            variables: { url, filename, alt, contentType, hasContent: !!content },
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

        // Step 4: Poll until file is ready (or failed)
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
              image?: { url: string; width: number; height: number };
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
          variables: { url, filename, alt, contentType, hasContent: !!content },
          response: readyFile,
          success: true,
          durationMs: Date.now() - startTime,
        });

        return formatSuccessResponse({
          success: true,
          mode: url ? "external_url" : "staged_upload",
          file: readyFile,
          message: `File uploaded successfully. CDN URL: ${readyFile.url}`,
        });
      } catch (error) {
        await logOperation({
          storeDomain,
          toolName: "upload_file",
          query: FILE_CREATE,
          variables: { url, filename, alt, contentType, hasContent: !!content },
          success: false,
          errorMessage: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - startTime,
        });
        return formatErrorResponse(error);
      }
    }
  );
}

/**
 * Detect the staged upload resource type from MIME type
 */
function detectResourceType(
  mimeType: string,
  contentType?: string
): string {
  if (contentType) {
    return contentType;
  }

  if (mimeType.startsWith("image/")) {
    return STAGED_UPLOAD_RESOURCES.IMAGE;
  }
  if (mimeType.startsWith("video/")) {
    return STAGED_UPLOAD_RESOURCES.VIDEO;
  }
  if (mimeType.includes("model") || mimeType.includes("gltf") || mimeType.includes("glb")) {
    return STAGED_UPLOAD_RESOURCES.MODEL_3D;
  }
  return STAGED_UPLOAD_RESOURCES.FILE;
}

/**
 * Detect content type from MIME type
 */
function detectContentType(mimeType: string): string | undefined {
  if (mimeType.startsWith("image/")) {
    return "IMAGE";
  }
  if (mimeType.startsWith("video/")) {
    return "VIDEO";
  }
  return "FILE";
}
