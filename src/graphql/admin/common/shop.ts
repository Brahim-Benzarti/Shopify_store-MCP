/**
 * GraphQL queries for shop/store information
 */

/**
 * Get basic shop information including name, domain, plan, and settings
 */
export const GET_SHOP = `#graphql
  query GetShop {
    shop {
      id
      name
      email
      url
      myshopifyDomain
      plan {
        displayName
        partnerDevelopment
        shopifyPlus
      }
      primaryDomain {
        url
        host
      }
      currencyCode
      weightUnit
      billingAddress {
        address1
        city
        province
        country
        zip
      }
      timezoneAbbreviation
      ianaTimezone
    }
  }
`;
