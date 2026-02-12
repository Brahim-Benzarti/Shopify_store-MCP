/**
 * GraphQL queries for collection operations
 */

/**
 * Get a paginated list of collections
 * Returns both smart and custom collections with rules and product counts
 */
export const GET_COLLECTIONS = `#graphql
  query GetCollections($first: Int!, $after: String, $query: String) {
    collections(first: $first, after: $after, query: $query) {
      edges {
        node {
          id
          title
          handle
          descriptionHtml
          sortOrder
          productsCount {
            count
          }
          ruleSet {
            appliedDisjunctively
            rules {
              column
              relation
              condition
            }
          }
          image {
            url
            altText
          }
          updatedAt
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
