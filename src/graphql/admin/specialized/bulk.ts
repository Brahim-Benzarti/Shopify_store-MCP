/**
 * GraphQL queries and mutations for bulk operations
 * Used by bulk_export and bulk_import smart tools
 */

/**
 * Start a bulk query operation
 * The query parameter should be a GraphQL query without the top-level `query` keyword
 * Example: { products { edges { node { id title } } } }
 */
export const BULK_OPERATION_RUN_QUERY = `#graphql
  mutation BulkOperationRunQuery($query: String!) {
    bulkOperationRunQuery(query: $query) {
      bulkOperation {
        id
        status
        query
        rootObjectCount
        objectCount
        createdAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Start a bulk mutation operation
 * Requires a staged upload path containing JSONL data
 */
export const BULK_OPERATION_RUN_MUTATION = `#graphql
  mutation BulkOperationRunMutation($mutation: String!, $stagedUploadPath: String!) {
    bulkOperationRunMutation(mutation: $mutation, stagedUploadPath: $stagedUploadPath) {
      bulkOperation {
        id
        status
        url
        objectCount
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Get current bulk operation status (for queries)
 * Deprecated in 2026-01, use GET_BULK_OPERATION_BY_ID instead
 */
export const GET_CURRENT_BULK_OPERATION = `#graphql
  query GetCurrentBulkOperation {
    currentBulkOperation {
      id
      type
      status
      query
      url
      rootObjectCount
      objectCount
      fileSize
      partialDataUrl
      errorCode
      createdAt
      completedAt
    }
  }
`;

/**
 * Get current bulk MUTATION operation status
 * Required for polling mutation status in versions < 2026-01
 */
export const GET_CURRENT_BULK_MUTATION = `#graphql
  query GetCurrentBulkMutation {
    currentBulkOperation(type: MUTATION) {
      id
      type
      status
      url
      objectCount
      fileSize
      partialDataUrl
      errorCode
      createdAt
      completedAt
    }
  }
`;

/**
 * Get a specific bulk operation by ID (API version 2026-01+)
 * Use this for polling both queries and mutations
 */
export const GET_BULK_OPERATION_BY_ID = `#graphql
  query GetBulkOperationById($id: ID!) {
    bulkOperation(id: $id) {
      id
      type
      status
      url
      objectCount
      fileSize
      partialDataUrl
      errorCode
      createdAt
      completedAt
    }
  }
`;

/**
 * Get a specific bulk operation by ID (legacy node query)
 */
export const GET_BULK_OPERATION = `#graphql
  query GetBulkOperation($id: ID!) {
    node(id: $id) {
      ... on BulkOperation {
        id
        type
        status
        query
        url
        rootObjectCount
        objectCount
        fileSize
        partialDataUrl
        errorCode
        createdAt
        completedAt
      }
    }
  }
`;

/**
 * Cancel a running bulk operation
 */
export const BULK_OPERATION_CANCEL = `#graphql
  mutation BulkOperationCancel($id: ID!) {
    bulkOperationCancel(id: $id) {
      bulkOperation {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Create staged upload targets for file upload
 * Used before bulk mutation to upload JSONL data
 */
export const STAGED_UPLOADS_CREATE = `#graphql
  mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
