/**
 * GraphQL queries and mutations for product operations
 */

/**
 * Get a paginated list of products with basic variant and image info
 * Supports search query filtering
 */
export const GET_PRODUCTS = `#graphql
  query GetProducts($first: Int!, $after: String, $query: String) {
    products(first: $first, after: $after, query: $query) {
      edges {
        node {
          id
          title
          handle
          descriptionHtml
          vendor
          productType
          status
          tags
          totalInventory
          createdAt
          updatedAt
          variants(first: 10) {
            edges {
              node {
                id
                title
                sku
                price
                inventoryQuantity
              }
            }
          }
          images(first: 5) {
            edges {
              node {
                id
                url
                altText
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
 * Get a single product by ID with full details
 * Includes all variants, images, options, and metafields
 */
export const GET_PRODUCT = `#graphql
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      title
      handle
      descriptionHtml
      vendor
      productType
      status
      tags
      totalInventory
      createdAt
      updatedAt
      options {
        id
        name
        values
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            sku
            price
            compareAtPrice
            inventoryQuantity
            selectedOptions {
              name
              value
            }
          }
        }
      }
      images(first: 20) {
        edges {
          node {
            id
            url
            altText
            width
            height
          }
        }
      }
      metafields(first: 20) {
        edges {
          node {
            id
            namespace
            key
            value
            type
          }
        }
      }
    }
  }
`;

/**
 * Create a new product
 * Returns the created product's basic info
 */
export const CREATE_PRODUCT = `#graphql
  mutation ProductCreate($product: ProductCreateInput!) {
    productCreate(product: $product) {
      product {
        id
        title
        handle
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
 * Update an existing product
 * Returns the updated product's basic info
 */
export const UPDATE_PRODUCT = `#graphql
  mutation ProductUpdate($product: ProductUpdateInput!) {
    productUpdate(product: $product) {
      product {
        id
        title
        handle
        status
        updatedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;
