/**
 * GraphQL queries and mutations for inventory operations
 */

/**
 * Get inventory levels for product variants across locations
 * Shows available, incoming, committed, reserved, and on-hand quantities
 */
export const GET_INVENTORY_LEVELS = `#graphql
  query GetInventoryLevels($first: Int!, $after: String, $query: String) {
    productVariants(first: $first, after: $after, query: $query) {
      edges {
        node {
          id
          title
          sku
          product {
            id
            title
          }
          inventoryItem {
            id
            tracked
            inventoryLevels(first: 10) {
              edges {
                node {
                  id
                  quantities(names: ["available", "incoming", "committed", "reserved", "on_hand"]) {
                    name
                    quantity
                  }
                  location {
                    id
                    name
                  }
                }
              }
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * Adjust inventory quantities at a specific location
 * Uses delta-based adjustment (positive to add, negative to subtract)
 */
export const ADJUST_INVENTORY_QUANTITIES = `#graphql
  mutation InventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
    inventoryAdjustQuantities(input: $input) {
      inventoryAdjustmentGroup {
        reason
        changes {
          name
          delta
          quantityAfterChange
          item {
            id
          }
          location {
            id
            name
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
