import { shopifyApiProject, ApiType } from "@shopify/api-codegen-preset";
import type { IGraphQLConfig } from "graphql-config";

// Shopify API version - update this when upgrading
const API_VERSION = "2026-01";

function getConfig(): IGraphQLConfig {
  const config: IGraphQLConfig = {
    projects: {
      // Admin API - store management operations
      adminApi: shopifyApiProject({
        apiType: ApiType.Admin,
        apiVersion: API_VERSION,
        documents: ["./src/graphql/admin/**/*.ts"],
        outputDir: "./src/types/admin",
      }),

      // Storefront API - customer-facing operations
      storefrontApi: shopifyApiProject({
        apiType: ApiType.Storefront,
        apiVersion: API_VERSION,
        documents: ["./src/graphql/storefront/**/*.ts"],
        outputDir: "./src/types/storefront",
      }),
    },
  };

  return config;
}

module.exports = getConfig();
