/**
 * GraphQL queries and mutations for metaobject operations
 * Used by upsert_metaobject and schema_discover smart tools
 */

/**
 * List all metaobject definitions (schema discovery)
 */
export const GET_METAOBJECT_DEFINITIONS = `#graphql
  query GetMetaobjectDefinitions($first: Int!, $after: String) {
    metaobjectDefinitions(first: $first, after: $after) {
      edges {
        node {
          id
          type
          name
          displayNameKey
          description
          fieldDefinitions {
            key
            name
            description
            type {
              name
            }
            required
            validations {
              name
              value
            }
          }
          capabilities {
            publishable {
              enabled
            }
            translatable {
              enabled
            }
            renderable {
              enabled
            }
          }
          access {
            admin
            storefront
          }
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
 * Get a single metaobject definition by type
 */
export const GET_METAOBJECT_DEFINITION_BY_TYPE = `#graphql
  query GetMetaobjectDefinitionByType($type: String!) {
    metaobjectDefinitionByType(type: $type) {
      id
      type
      name
      displayNameKey
      description
      fieldDefinitions {
        key
        name
        description
        type {
          name
        }
        required
      }
      capabilities {
        publishable {
          enabled
        }
      }
    }
  }
`;

/**
 * List metaobjects by type
 */
export const GET_METAOBJECTS = `#graphql
  query GetMetaobjects($type: String!, $first: Int!, $after: String) {
    metaobjects(type: $type, first: $first, after: $after) {
      edges {
        node {
          id
          handle
          type
          displayName
          fields {
            key
            value
            type
          }
          capabilities {
            publishable {
              status
            }
          }
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
`;

/**
 * Get a single metaobject by ID
 */
export const GET_METAOBJECT = `#graphql
  query GetMetaobject($id: ID!) {
    metaobject(id: $id) {
      id
      handle
      type
      displayName
      fields {
        key
        value
        type
      }
      capabilities {
        publishable {
          status
        }
      }
      createdAt
      updatedAt
    }
  }
`;

/**
 * Get a metaobject by handle (for upsert check)
 */
export const GET_METAOBJECT_BY_HANDLE = `#graphql
  query GetMetaobjectByHandle($handle: MetaobjectHandleInput!) {
    metaobjectByHandle(handle: $handle) {
      id
      handle
      type
      displayName
      fields {
        key
        value
        type
      }
      capabilities {
        publishable {
          status
        }
      }
    }
  }
`;

/**
 * Create a new metaobject
 */
export const METAOBJECT_CREATE = `#graphql
  mutation MetaobjectCreate($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject {
        id
        handle
        type
        displayName
        fields {
          key
          value
          type
        }
        capabilities {
          publishable {
            status
          }
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

/**
 * Update an existing metaobject
 */
export const METAOBJECT_UPDATE = `#graphql
  mutation MetaobjectUpdate($id: ID!, $metaobject: MetaobjectUpdateInput!) {
    metaobjectUpdate(id: $id, metaobject: $metaobject) {
      metaobject {
        id
        handle
        type
        displayName
        fields {
          key
          value
          type
        }
        capabilities {
          publishable {
            status
          }
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

/**
 * Delete a metaobject
 */
export const METAOBJECT_DELETE = `#graphql
  mutation MetaobjectDelete($id: ID!) {
    metaobjectDelete(id: $id) {
      deletedId
      userErrors {
        field
        message
        code
      }
    }
  }
`;
