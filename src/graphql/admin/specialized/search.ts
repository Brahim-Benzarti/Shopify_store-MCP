/**
 * GraphQL queries for search operations across different resource types
 * Note: Shopify Admin API doesn't have a unified search endpoint.
 * Use individual resource queries with the query parameter for filtering.
 */

/**
 * Search products by query string
 */
export const SEARCH_PRODUCTS = `#graphql
  query SearchProducts($first: Int!, $after: String, $query: String!) {
    products(first: $first, after: $after, query: $query) {
      edges {
        node {
          __typename
          id
          title
          handle
          status
          vendor
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
 * Search orders by query string
 */
export const SEARCH_ORDERS = `#graphql
  query SearchOrders($first: Int!, $after: String, $query: String!) {
    orders(first: $first, after: $after, query: $query) {
      edges {
        node {
          __typename
          id
          name
          email
          displayFinancialStatus
          displayFulfillmentStatus
          createdAt
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
 * Search customers by query string
 */
export const SEARCH_CUSTOMERS = `#graphql
  query SearchCustomers($first: Int!, $after: String, $query: String!) {
    customers(first: $first, after: $after, query: $query) {
      edges {
        node {
          __typename
          id
          displayName
          email
          numberOfOrders
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
 * Search collections by query string
 */
export const SEARCH_COLLECTIONS = `#graphql
  query SearchCollections($first: Int!, $after: String, $query: String!) {
    collections(first: $first, after: $after, query: $query) {
      edges {
        node {
          __typename
          id
          title
          handle
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
