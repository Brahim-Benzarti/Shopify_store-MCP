import type { UserError } from "./types.js";

export function formatErrorResponse(error: unknown): {
  content: Array<{ type: "text"; text: string }>;
  isError: true;
} {
  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else {
    message = JSON.stringify(error);
  }

  return {
    content: [{ type: "text" as const, text: `Error: ${message}` }],
    isError: true,
  };
}

export function formatGraphQLErrors(response: {
  errors?: unknown;
  extensions?: Record<string, unknown>;
}): {
  content: Array<{ type: "text"; text: string }>;
  isError: true;
} {
  const parts: string[] = [];

  if (response.errors) {
    if (Array.isArray(response.errors)) {
      for (const err of response.errors) {
        parts.push(err.message || JSON.stringify(err));
      }
    } else if (typeof response.errors === "object") {
      const errObj = response.errors as Record<string, unknown>;
      if (errObj.networkStatusCode) {
        const code = errObj.networkStatusCode as number;
        parts.push(`HTTP ${code}`);
        if (code === 401) {
          parts.push(
            "The access token is invalid or expired. Check SHOPIFY_ACCESS_TOKEN."
          );
        } else if (code === 403) {
          parts.push(
            "The access token lacks required scopes. Update your custom app's API access scopes in Shopify Admin."
          );
        } else if (code === 429) {
          parts.push("Rate limited by Shopify. Wait a moment and retry.");
        }
      }
      if (errObj.message) {
        parts.push(String(errObj.message));
      }
      if (Array.isArray(errObj.graphQLErrors)) {
        for (const gqlErr of errObj.graphQLErrors) {
          parts.push(`GraphQL: ${gqlErr.message}`);
        }
      }
    } else {
      parts.push(String(response.errors));
    }
  }

  if (parts.length === 0) {
    parts.push("Unknown GraphQL error");
  }

  return {
    content: [{ type: "text" as const, text: parts.join("\n") }],
    isError: true,
  };
}

export function formatUserErrors(userErrors: UserError[]): {
  content: Array<{ type: "text"; text: string }>;
  isError: true;
} {
  const lines = userErrors.map(
    (e) => `- ${e.field?.join(".") || "general"}: ${e.message}`
  );
  return {
    content: [
      {
        type: "text" as const,
        text: `Shopify validation errors:\n${lines.join("\n")}`,
      },
    ],
    isError: true,
  };
}

export function formatSuccessResponse(data: unknown): {
  content: Array<{ type: "text"; text: string }>;
} {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Normalize a Shopify ID — accepts either a numeric ID or a full GID.
 * e.g. "123" becomes "gid://shopify/Product/123" when resourceType is "Product"
 */
export function normalizeGid(id: string, resourceType: string): string {
  if (id.startsWith("gid://")) {
    return id;
  }
  return `gid://shopify/${resourceType}/${id}`;
}
