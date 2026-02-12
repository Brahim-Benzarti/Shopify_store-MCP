/**
 * GraphQL queries for customer operations
 */

/**
 * Get a paginated list of customers with basic info
 * Supports search query filtering
 */
export const GET_CUSTOMERS = `#graphql
  query GetCustomers($first: Int!, $after: String, $query: String) {
    customers(first: $first, after: $after, query: $query) {
      edges {
        node {
          id
          displayName
          email
          phone
          state
          numberOfOrders
          amountSpent {
            amount
            currencyCode
          }
          createdAt
          updatedAt
          tags
          defaultAddress {
            city
            province
            country
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
 * Get a single customer by ID with full details
 * Includes addresses, recent orders, and metafields
 */
export const GET_CUSTOMER = `#graphql
  query GetCustomer($id: ID!) {
    customer(id: $id) {
      id
      displayName
      firstName
      lastName
      email
      phone
      state
      note
      tags
      numberOfOrders
      amountSpent {
        amount
        currencyCode
      }
      createdAt
      updatedAt
      defaultAddress {
        address1
        address2
        city
        province
        country
        zip
        phone
      }
      addresses {
        address1
        address2
        city
        province
        country
        zip
      }
      orders(first: 10) {
        edges {
          node {
            id
            name
            createdAt
            displayFinancialStatus
            displayFulfillmentStatus
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
          }
        }
      }
      metafields(first: 10) {
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
