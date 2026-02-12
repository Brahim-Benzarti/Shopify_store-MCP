import { createAdminApiClient, type AdminApiClient } from "@shopify/admin-api-client";
import { createStorefrontApiClient, type StorefrontApiClient } from "@shopify/storefront-api-client";
import type { ShopifyConfig } from "./config.js";

let adminClientInstance: AdminApiClient | null = null;
let storefrontClientInstance: StorefrontApiClient | null = null;

/**
 * Get the Admin API client (singleton).
 * Used for store management operations: products, orders, customers, inventory, etc.
 */
export function getAdminClient(config: ShopifyConfig): AdminApiClient {
  if (!adminClientInstance) {
    adminClientInstance = createAdminApiClient({
      storeDomain: config.storeDomain,
      apiVersion: config.apiVersion,
      accessToken: config.adminAccessToken,
    });
  }
  return adminClientInstance;
}

/**
 * Get the Storefront API client (singleton).
 * Used for customer-facing operations: product browsing, cart, checkout, etc.
 * Requires SHOPIFY_STOREFRONT_ACCESS_TOKEN to be set.
 */
export function getStorefrontClient(config: ShopifyConfig): StorefrontApiClient | null {
  if (!config.storefrontAccessToken) {
    return null;
  }

  if (!storefrontClientInstance) {
    storefrontClientInstance = createStorefrontApiClient({
      storeDomain: config.storeDomain,
      apiVersion: config.apiVersion,
      publicAccessToken: config.storefrontAccessToken,
    });
  }
  return storefrontClientInstance;
}

// Legacy alias for backwards compatibility
export const getShopifyClient = getAdminClient;

export type { AdminApiClient, StorefrontApiClient };
