/**
 * GraphQL queries and mutations for metafield operations
 */

/**
 * Get metafields for a specific resource owner
 * Supports filtering by namespace
 */
export const GET_METAFIELDS_BY_OWNER = `#graphql
  query GetMetafieldsByOwner($ownerId: ID!, $first: Int!, $after: String, $namespace: String) {
    node(id: $ownerId) {
      ... on HasMetafields {
        metafields(first: $first, after: $after, namespace: $namespace) {
          edges {
            node {
              id
              namespace
              key
              value
              type
              createdAt
              updatedAt
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  }
`;

/**
 * Set (create or update) metafields on any resource
 * If a metafield with the same namespace/key exists, it will be updated
 */
export const SET_METAFIELDS = `#graphql
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        namespace
        key
        value
        type
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Get metafield definitions for a resource type
 * Used for schema discovery
 */
export const GET_METAFIELD_DEFINITIONS = `#graphql
  query GetMetafieldDefinitions($ownerType: MetafieldOwnerType!, $first: Int!, $after: String) {
    metafieldDefinitions(ownerType: $ownerType, first: $first, after: $after) {
      edges {
        node {
          id
          name
          namespace
          key
          type {
            name
          }
          description
          validations {
            name
            value
          }
          pinnedPosition
          ownerType
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * Delete a metafield by ID
 */
export const DELETE_METAFIELD = `#graphql
  mutation MetafieldDelete($input: MetafieldDeleteInput!) {
    metafieldDelete(input: $input) {
      deletedId
      userErrors {
        field
        message
      }
    }
  }
`;
