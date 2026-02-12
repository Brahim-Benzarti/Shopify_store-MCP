/**
 * GraphQL queries for order operations
 */

/**
 * Get a paginated list of orders with basic customer and line item info
 * Supports search query filtering
 */
export const GET_ORDERS = `#graphql
  query GetOrders($first: Int!, $after: String, $query: String) {
    orders(first: $first, after: $after, query: $query) {
      edges {
        node {
          id
          name
          email
          createdAt
          displayFinancialStatus
          displayFulfillmentStatus
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          customer {
            id
            displayName
            email
          }
          lineItems(first: 10) {
            edges {
              node {
                title
                quantity
                originalUnitPriceSet {
                  shopMoney {
                    amount
                    currencyCode
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
 * Get a single order by ID with full details
 * Includes line items, customer, addresses, fulfillments, and financial info
 */
export const GET_ORDER = `#graphql
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      name
      email
      phone
      createdAt
      updatedAt
      cancelledAt
      closedAt
      displayFinancialStatus
      displayFulfillmentStatus
      note
      tags
      totalPriceSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      subtotalPriceSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      totalTaxSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      totalShippingPriceSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      customer {
        id
        displayName
        email
        phone
      }
      shippingAddress {
        address1
        address2
        city
        province
        country
        zip
      }
      lineItems(first: 50) {
        edges {
          node {
            title
            quantity
            sku
            originalUnitPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            variant {
              id
              title
            }
          }
        }
      }
      fulfillments {
        id
        status
        trackingInfo {
          number
          url
          company
        }
      }
    }
  }
`;
