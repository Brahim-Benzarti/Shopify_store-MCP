/**
 * GraphQL queries and mutations for file operations
 * Used by the upload_file smart tool
 */

/**
 * Create file(s) from external URL
 * Shopify will fetch the file and process it
 */
export const FILE_CREATE = `#graphql
  mutation FileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        id
        alt
        createdAt
        fileStatus
        fileErrors {
          code
          details
          message
        }
        ... on GenericFile {
          url
          mimeType
          originalFileSize
        }
        ... on MediaImage {
          id
          alt
          mimeType
          image {
            url
            width
            height
          }
        }
        ... on Video {
          id
          alt
          originalSource {
            url
            mimeType
          }
          duration
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Get file status by ID
 * Used for polling until file is READY
 */
export const GET_FILE = `#graphql
  query GetFile($id: ID!) {
    node(id: $id) {
      ... on GenericFile {
        id
        alt
        fileStatus
        url
        mimeType
        originalFileSize
        fileErrors {
          code
          details
          message
        }
      }
      ... on MediaImage {
        id
        alt
        fileStatus
        image {
          url
          width
          height
        }
        fileErrors {
          code
          details
          message
        }
      }
      ... on Video {
        id
        alt
        fileStatus
        originalSource {
          url
        }
        duration
        fileErrors {
          code
          details
          message
        }
      }
    }
  }
`;

/**
 * List files with optional filtering
 */
export const GET_FILES = `#graphql
  query GetFiles($first: Int!, $after: String, $query: String) {
    files(first: $first, after: $after, query: $query) {
      edges {
        node {
          id
          alt
          createdAt
          fileStatus
          fileErrors {
            code
            details
            message
          }
          ... on GenericFile {
            url
            mimeType
            originalFileSize
          }
          ... on MediaImage {
            id
            alt
            mimeType
            image {
              url
              width
              height
            }
          }
          ... on Video {
            id
            alt
            originalSource {
              url
              mimeType
            }
            duration
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
 * Delete file(s)
 */
export const FILE_DELETE = `#graphql
  mutation FileDelete($fileIds: [ID!]!) {
    fileDelete(fileIds: $fileIds) {
      deletedFileIds
      userErrors {
        field
        message
      }
    }
  }
`;
