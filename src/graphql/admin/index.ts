/**
 * Admin API GraphQL queries and mutations
 * Re-exports all queries organized by domain
 */

// Common queries
export * from "./common/shop.js";
export * from "./common/products.js";
export * from "./common/orders.js";
export * from "./common/customers.js";
export * from "./common/collections.js";

// Specialized queries
export * from "./specialized/inventory.js";
export * from "./specialized/metafields.js";
export * from "./specialized/search.js";
export * from "./specialized/files.js";
export * from "./specialized/bulk.js";
export * from "./specialized/metaobjects.js";
