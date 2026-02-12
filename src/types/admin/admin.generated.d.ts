/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types.d.ts';

export type GetCollectionsQueryVariables = AdminTypes.Exact<{
  first: AdminTypes.Scalars['Int']['input'];
  after?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  query?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
}>;


export type GetCollectionsQuery = { collections: { edges: Array<(
      Pick<AdminTypes.CollectionEdge, 'cursor'>
      & { node: (
        Pick<AdminTypes.Collection, 'id' | 'title' | 'handle' | 'descriptionHtml' | 'sortOrder' | 'updatedAt'>
        & { productsCount?: AdminTypes.Maybe<Pick<AdminTypes.Count, 'count'>>, ruleSet?: AdminTypes.Maybe<(
          Pick<AdminTypes.CollectionRuleSet, 'appliedDisjunctively'>
          & { rules: Array<Pick<AdminTypes.CollectionRule, 'column' | 'relation' | 'condition'>> }
        )>, image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url' | 'altText'>> }
      ) }
    )>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'endCursor'> } };

export type GetCustomersQueryVariables = AdminTypes.Exact<{
  first: AdminTypes.Scalars['Int']['input'];
  after?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  query?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
}>;


export type GetCustomersQuery = { customers: { edges: Array<(
      Pick<AdminTypes.CustomerEdge, 'cursor'>
      & { node: (
        Pick<AdminTypes.Customer, 'id' | 'displayName' | 'email' | 'phone' | 'state' | 'numberOfOrders' | 'createdAt' | 'updatedAt' | 'tags'>
        & { amountSpent: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'>, defaultAddress?: AdminTypes.Maybe<Pick<AdminTypes.MailingAddress, 'city' | 'province' | 'country'>> }
      ) }
    )>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'endCursor'> } };

export type GetCustomerQueryVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
}>;


export type GetCustomerQuery = { customer?: AdminTypes.Maybe<(
    Pick<AdminTypes.Customer, 'id' | 'displayName' | 'firstName' | 'lastName' | 'email' | 'phone' | 'state' | 'note' | 'tags' | 'numberOfOrders' | 'createdAt' | 'updatedAt'>
    & { amountSpent: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'>, defaultAddress?: AdminTypes.Maybe<Pick<AdminTypes.MailingAddress, 'address1' | 'address2' | 'city' | 'province' | 'country' | 'zip' | 'phone'>>, addresses: Array<Pick<AdminTypes.MailingAddress, 'address1' | 'address2' | 'city' | 'province' | 'country' | 'zip'>>, orders: { edges: Array<{ node: (
          Pick<AdminTypes.Order, 'id' | 'name' | 'createdAt' | 'displayFinancialStatus' | 'displayFulfillmentStatus'>
          & { totalPriceSet: { shopMoney: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'> } }
        ) }> }, metafields: { edges: Array<{ node: Pick<AdminTypes.Metafield, 'id' | 'namespace' | 'key' | 'value' | 'type'> }> } }
  )> };

export type GetOrdersQueryVariables = AdminTypes.Exact<{
  first: AdminTypes.Scalars['Int']['input'];
  after?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  query?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
}>;


export type GetOrdersQuery = { orders: { edges: Array<(
      Pick<AdminTypes.OrderEdge, 'cursor'>
      & { node: (
        Pick<AdminTypes.Order, 'id' | 'name' | 'email' | 'createdAt' | 'displayFinancialStatus' | 'displayFulfillmentStatus'>
        & { totalPriceSet: { shopMoney: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'> }, customer?: AdminTypes.Maybe<Pick<AdminTypes.Customer, 'id' | 'displayName' | 'email'>>, lineItems: { edges: Array<{ node: (
              Pick<AdminTypes.LineItem, 'title' | 'quantity'>
              & { originalUnitPriceSet: { shopMoney: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'> } }
            ) }> } }
      ) }
    )>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'endCursor'> } };

export type GetOrderQueryVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
}>;


export type GetOrderQuery = { order?: AdminTypes.Maybe<(
    Pick<AdminTypes.Order, 'id' | 'name' | 'email' | 'phone' | 'createdAt' | 'updatedAt' | 'cancelledAt' | 'closedAt' | 'displayFinancialStatus' | 'displayFulfillmentStatus' | 'note' | 'tags'>
    & { totalPriceSet: { shopMoney: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'> }, subtotalPriceSet?: AdminTypes.Maybe<{ shopMoney: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'> }>, totalTaxSet?: AdminTypes.Maybe<{ shopMoney: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'> }>, totalShippingPriceSet: { shopMoney: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'> }, customer?: AdminTypes.Maybe<Pick<AdminTypes.Customer, 'id' | 'displayName' | 'email' | 'phone'>>, shippingAddress?: AdminTypes.Maybe<Pick<AdminTypes.MailingAddress, 'address1' | 'address2' | 'city' | 'province' | 'country' | 'zip'>>, lineItems: { edges: Array<{ node: (
          Pick<AdminTypes.LineItem, 'title' | 'quantity' | 'sku'>
          & { originalUnitPriceSet: { shopMoney: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'> }, variant?: AdminTypes.Maybe<Pick<AdminTypes.ProductVariant, 'id' | 'title'>> }
        ) }> }, fulfillments: Array<(
      Pick<AdminTypes.Fulfillment, 'id' | 'status'>
      & { trackingInfo: Array<Pick<AdminTypes.FulfillmentTrackingInfo, 'number' | 'url' | 'company'>> }
    )> }
  )> };

export type GetProductsQueryVariables = AdminTypes.Exact<{
  first: AdminTypes.Scalars['Int']['input'];
  after?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  query?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
}>;


export type GetProductsQuery = { products: { edges: Array<(
      Pick<AdminTypes.ProductEdge, 'cursor'>
      & { node: (
        Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'descriptionHtml' | 'vendor' | 'productType' | 'status' | 'tags' | 'totalInventory' | 'createdAt' | 'updatedAt'>
        & { variants: { edges: Array<{ node: Pick<AdminTypes.ProductVariant, 'id' | 'title' | 'sku' | 'price' | 'inventoryQuantity'> }> }, images: { edges: Array<{ node: Pick<AdminTypes.Image, 'id' | 'url' | 'altText'> }> } }
      ) }
    )>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'endCursor'> } };

export type GetProductQueryVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
}>;


export type GetProductQuery = { product?: AdminTypes.Maybe<(
    Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'descriptionHtml' | 'vendor' | 'productType' | 'status' | 'tags' | 'totalInventory' | 'createdAt' | 'updatedAt'>
    & { options: Array<Pick<AdminTypes.ProductOption, 'id' | 'name' | 'values'>>, variants: { edges: Array<{ node: (
          Pick<AdminTypes.ProductVariant, 'id' | 'title' | 'sku' | 'price' | 'compareAtPrice' | 'inventoryQuantity'>
          & { selectedOptions: Array<Pick<AdminTypes.SelectedOption, 'name' | 'value'>> }
        ) }> }, images: { edges: Array<{ node: Pick<AdminTypes.Image, 'id' | 'url' | 'altText' | 'width' | 'height'> }> }, metafields: { edges: Array<{ node: Pick<AdminTypes.Metafield, 'id' | 'namespace' | 'key' | 'value' | 'type'> }> } }
  )> };

export type ProductCreateMutationVariables = AdminTypes.Exact<{
  product: AdminTypes.ProductCreateInput;
}>;


export type ProductCreateMutation = { productCreate?: AdminTypes.Maybe<{ product?: AdminTypes.Maybe<Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'status'>>, userErrors: Array<Pick<AdminTypes.UserError, 'field' | 'message'>> }> };

export type ProductUpdateMutationVariables = AdminTypes.Exact<{
  product: AdminTypes.ProductUpdateInput;
}>;


export type ProductUpdateMutation = { productUpdate?: AdminTypes.Maybe<{ product?: AdminTypes.Maybe<Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'status' | 'updatedAt'>>, userErrors: Array<Pick<AdminTypes.UserError, 'field' | 'message'>> }> };

export type GetShopQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type GetShopQuery = { shop: (
    Pick<AdminTypes.Shop, 'id' | 'name' | 'email' | 'url' | 'myshopifyDomain' | 'currencyCode' | 'weightUnit' | 'timezoneAbbreviation' | 'ianaTimezone'>
    & { plan: Pick<AdminTypes.ShopPlan, 'displayName' | 'partnerDevelopment' | 'shopifyPlus'>, primaryDomain: Pick<AdminTypes.Domain, 'url' | 'host'>, billingAddress: Pick<AdminTypes.ShopAddress, 'address1' | 'city' | 'province' | 'country' | 'zip'> }
  ) };

export type GetInventoryLevelsQueryVariables = AdminTypes.Exact<{
  first: AdminTypes.Scalars['Int']['input'];
  after?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  query?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
}>;


export type GetInventoryLevelsQuery = { productVariants: { edges: Array<(
      Pick<AdminTypes.ProductVariantEdge, 'cursor'>
      & { node: (
        Pick<AdminTypes.ProductVariant, 'id' | 'title' | 'sku'>
        & { product: Pick<AdminTypes.Product, 'id' | 'title'>, inventoryItem: (
          Pick<AdminTypes.InventoryItem, 'id' | 'tracked'>
          & { inventoryLevels: { edges: Array<{ node: (
                Pick<AdminTypes.InventoryLevel, 'id'>
                & { quantities: Array<Pick<AdminTypes.InventoryQuantity, 'name' | 'quantity'>>, location: Pick<AdminTypes.Location, 'id' | 'name'> }
              ) }> } }
        ) }
      ) }
    )>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'endCursor'> } };

export type InventoryAdjustQuantitiesMutationVariables = AdminTypes.Exact<{
  input: AdminTypes.InventoryAdjustQuantitiesInput;
}>;


export type InventoryAdjustQuantitiesMutation = { inventoryAdjustQuantities?: AdminTypes.Maybe<{ inventoryAdjustmentGroup?: AdminTypes.Maybe<(
      Pick<AdminTypes.InventoryAdjustmentGroup, 'reason'>
      & { changes: Array<(
        Pick<AdminTypes.InventoryChange, 'name' | 'delta' | 'quantityAfterChange'>
        & { item?: AdminTypes.Maybe<Pick<AdminTypes.InventoryItem, 'id'>>, location?: AdminTypes.Maybe<Pick<AdminTypes.Location, 'id' | 'name'>> }
      )> }
    )>, userErrors: Array<Pick<AdminTypes.InventoryAdjustQuantitiesUserError, 'field' | 'message'>> }> };

export type GetMetafieldsByOwnerQueryVariables = AdminTypes.Exact<{
  ownerId: AdminTypes.Scalars['ID']['input'];
  first: AdminTypes.Scalars['Int']['input'];
  after?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  namespace?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
}>;


export type GetMetafieldsByOwnerQuery = { node?: AdminTypes.Maybe<{ metafields: { edges: Array<{ node: Pick<AdminTypes.Metafield, 'id' | 'namespace' | 'key' | 'value' | 'type' | 'createdAt' | 'updatedAt'> }>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'endCursor'> } } | { metafields: { edges: Array<{ node: Pick<AdminTypes.Metafield, 'id' | 'namespace' | 'key' | 'value' | 'type' | 'createdAt' | 'updatedAt'> }>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'endCursor'> } }> };

export type MetafieldsSetMutationVariables = AdminTypes.Exact<{
  metafields: Array<AdminTypes.MetafieldsSetInput> | AdminTypes.MetafieldsSetInput;
}>;


export type MetafieldsSetMutation = { metafieldsSet?: AdminTypes.Maybe<{ metafields?: AdminTypes.Maybe<Array<Pick<AdminTypes.Metafield, 'id' | 'namespace' | 'key' | 'value' | 'type'>>>, userErrors: Array<Pick<AdminTypes.MetafieldsSetUserError, 'field' | 'message'>> }> };

export type SearchProductsQueryVariables = AdminTypes.Exact<{
  first: AdminTypes.Scalars['Int']['input'];
  after?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  query: AdminTypes.Scalars['String']['input'];
}>;


export type SearchProductsQuery = { products: { edges: Array<(
      Pick<AdminTypes.ProductEdge, 'cursor'>
      & { node: (
        { __typename: 'Product' }
        & Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'status' | 'vendor'>
      ) }
    )>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'endCursor'> } };

export type SearchOrdersQueryVariables = AdminTypes.Exact<{
  first: AdminTypes.Scalars['Int']['input'];
  after?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  query: AdminTypes.Scalars['String']['input'];
}>;


export type SearchOrdersQuery = { orders: { edges: Array<(
      Pick<AdminTypes.OrderEdge, 'cursor'>
      & { node: (
        { __typename: 'Order' }
        & Pick<AdminTypes.Order, 'id' | 'name' | 'email' | 'displayFinancialStatus' | 'displayFulfillmentStatus' | 'createdAt'>
      ) }
    )>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'endCursor'> } };

export type SearchCustomersQueryVariables = AdminTypes.Exact<{
  first: AdminTypes.Scalars['Int']['input'];
  after?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  query: AdminTypes.Scalars['String']['input'];
}>;


export type SearchCustomersQuery = { customers: { edges: Array<(
      Pick<AdminTypes.CustomerEdge, 'cursor'>
      & { node: (
        { __typename: 'Customer' }
        & Pick<AdminTypes.Customer, 'id' | 'displayName' | 'email' | 'numberOfOrders'>
      ) }
    )>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'endCursor'> } };

export type SearchCollectionsQueryVariables = AdminTypes.Exact<{
  first: AdminTypes.Scalars['Int']['input'];
  after?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  query: AdminTypes.Scalars['String']['input'];
}>;


export type SearchCollectionsQuery = { collections: { edges: Array<(
      Pick<AdminTypes.CollectionEdge, 'cursor'>
      & { node: (
        { __typename: 'Collection' }
        & Pick<AdminTypes.Collection, 'id' | 'title' | 'handle'>
      ) }
    )>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'endCursor'> } };

interface GeneratedQueryTypes {
  "#graphql\n  query GetCollections($first: Int!, $after: String, $query: String) {\n    collections(first: $first, after: $after, query: $query) {\n      edges {\n        node {\n          id\n          title\n          handle\n          descriptionHtml\n          sortOrder\n          productsCount {\n            count\n          }\n          ruleSet {\n            appliedDisjunctively\n            rules {\n              column\n              relation\n              condition\n            }\n          }\n          image {\n            url\n            altText\n          }\n          updatedAt\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": {return: GetCollectionsQuery, variables: GetCollectionsQueryVariables},
  "#graphql\n  query GetCustomers($first: Int!, $after: String, $query: String) {\n    customers(first: $first, after: $after, query: $query) {\n      edges {\n        node {\n          id\n          displayName\n          email\n          phone\n          state\n          numberOfOrders\n          amountSpent {\n            amount\n            currencyCode\n          }\n          createdAt\n          updatedAt\n          tags\n          defaultAddress {\n            city\n            province\n            country\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": {return: GetCustomersQuery, variables: GetCustomersQueryVariables},
  "#graphql\n  query GetCustomer($id: ID!) {\n    customer(id: $id) {\n      id\n      displayName\n      firstName\n      lastName\n      email\n      phone\n      state\n      note\n      tags\n      numberOfOrders\n      amountSpent {\n        amount\n        currencyCode\n      }\n      createdAt\n      updatedAt\n      defaultAddress {\n        address1\n        address2\n        city\n        province\n        country\n        zip\n        phone\n      }\n      addresses {\n        address1\n        address2\n        city\n        province\n        country\n        zip\n      }\n      orders(first: 10) {\n        edges {\n          node {\n            id\n            name\n            createdAt\n            displayFinancialStatus\n            displayFulfillmentStatus\n            totalPriceSet {\n              shopMoney {\n                amount\n                currencyCode\n              }\n            }\n          }\n        }\n      }\n      metafields(first: 10) {\n        edges {\n          node {\n            id\n            namespace\n            key\n            value\n            type\n          }\n        }\n      }\n    }\n  }\n": {return: GetCustomerQuery, variables: GetCustomerQueryVariables},
  "#graphql\n  query GetOrders($first: Int!, $after: String, $query: String) {\n    orders(first: $first, after: $after, query: $query) {\n      edges {\n        node {\n          id\n          name\n          email\n          createdAt\n          displayFinancialStatus\n          displayFulfillmentStatus\n          totalPriceSet {\n            shopMoney {\n              amount\n              currencyCode\n            }\n          }\n          customer {\n            id\n            displayName\n            email\n          }\n          lineItems(first: 10) {\n            edges {\n              node {\n                title\n                quantity\n                originalUnitPriceSet {\n                  shopMoney {\n                    amount\n                    currencyCode\n                  }\n                }\n              }\n            }\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": {return: GetOrdersQuery, variables: GetOrdersQueryVariables},
  "#graphql\n  query GetOrder($id: ID!) {\n    order(id: $id) {\n      id\n      name\n      email\n      phone\n      createdAt\n      updatedAt\n      cancelledAt\n      closedAt\n      displayFinancialStatus\n      displayFulfillmentStatus\n      note\n      tags\n      totalPriceSet {\n        shopMoney {\n          amount\n          currencyCode\n        }\n      }\n      subtotalPriceSet {\n        shopMoney {\n          amount\n          currencyCode\n        }\n      }\n      totalTaxSet {\n        shopMoney {\n          amount\n          currencyCode\n        }\n      }\n      totalShippingPriceSet {\n        shopMoney {\n          amount\n          currencyCode\n        }\n      }\n      customer {\n        id\n        displayName\n        email\n        phone\n      }\n      shippingAddress {\n        address1\n        address2\n        city\n        province\n        country\n        zip\n      }\n      lineItems(first: 50) {\n        edges {\n          node {\n            title\n            quantity\n            sku\n            originalUnitPriceSet {\n              shopMoney {\n                amount\n                currencyCode\n              }\n            }\n            variant {\n              id\n              title\n            }\n          }\n        }\n      }\n      fulfillments {\n        id\n        status\n        trackingInfo {\n          number\n          url\n          company\n        }\n      }\n    }\n  }\n": {return: GetOrderQuery, variables: GetOrderQueryVariables},
  "#graphql\n  query GetProducts($first: Int!, $after: String, $query: String) {\n    products(first: $first, after: $after, query: $query) {\n      edges {\n        node {\n          id\n          title\n          handle\n          descriptionHtml\n          vendor\n          productType\n          status\n          tags\n          totalInventory\n          createdAt\n          updatedAt\n          variants(first: 10) {\n            edges {\n              node {\n                id\n                title\n                sku\n                price\n                inventoryQuantity\n              }\n            }\n          }\n          images(first: 5) {\n            edges {\n              node {\n                id\n                url\n                altText\n              }\n            }\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": {return: GetProductsQuery, variables: GetProductsQueryVariables},
  "#graphql\n  query GetProduct($id: ID!) {\n    product(id: $id) {\n      id\n      title\n      handle\n      descriptionHtml\n      vendor\n      productType\n      status\n      tags\n      totalInventory\n      createdAt\n      updatedAt\n      options {\n        id\n        name\n        values\n      }\n      variants(first: 100) {\n        edges {\n          node {\n            id\n            title\n            sku\n            price\n            compareAtPrice\n            inventoryQuantity\n            selectedOptions {\n              name\n              value\n            }\n          }\n        }\n      }\n      images(first: 20) {\n        edges {\n          node {\n            id\n            url\n            altText\n            width\n            height\n          }\n        }\n      }\n      metafields(first: 20) {\n        edges {\n          node {\n            id\n            namespace\n            key\n            value\n            type\n          }\n        }\n      }\n    }\n  }\n": {return: GetProductQuery, variables: GetProductQueryVariables},
  "#graphql\n  query GetShop {\n    shop {\n      id\n      name\n      email\n      url\n      myshopifyDomain\n      plan {\n        displayName\n        partnerDevelopment\n        shopifyPlus\n      }\n      primaryDomain {\n        url\n        host\n      }\n      currencyCode\n      weightUnit\n      billingAddress {\n        address1\n        city\n        province\n        country\n        zip\n      }\n      timezoneAbbreviation\n      ianaTimezone\n    }\n  }\n": {return: GetShopQuery, variables: GetShopQueryVariables},
  "#graphql\n  query GetInventoryLevels($first: Int!, $after: String, $query: String) {\n    productVariants(first: $first, after: $after, query: $query) {\n      edges {\n        node {\n          id\n          title\n          sku\n          product {\n            id\n            title\n          }\n          inventoryItem {\n            id\n            tracked\n            inventoryLevels(first: 10) {\n              edges {\n                node {\n                  id\n                  quantities(names: [\"available\", \"incoming\", \"committed\", \"reserved\", \"on_hand\"]) {\n                    name\n                    quantity\n                  }\n                  location {\n                    id\n                    name\n                  }\n                }\n              }\n            }\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": {return: GetInventoryLevelsQuery, variables: GetInventoryLevelsQueryVariables},
  "#graphql\n  query GetMetafieldsByOwner($ownerId: ID!, $first: Int!, $after: String, $namespace: String) {\n    node(id: $ownerId) {\n      ... on HasMetafields {\n        metafields(first: $first, after: $after, namespace: $namespace) {\n          edges {\n            node {\n              id\n              namespace\n              key\n              value\n              type\n              createdAt\n              updatedAt\n            }\n          }\n          pageInfo {\n            hasNextPage\n            endCursor\n          }\n        }\n      }\n    }\n  }\n": {return: GetMetafieldsByOwnerQuery, variables: GetMetafieldsByOwnerQueryVariables},
  "#graphql\n  query SearchProducts($first: Int!, $after: String, $query: String!) {\n    products(first: $first, after: $after, query: $query) {\n      edges {\n        node {\n          __typename\n          id\n          title\n          handle\n          status\n          vendor\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": {return: SearchProductsQuery, variables: SearchProductsQueryVariables},
  "#graphql\n  query SearchOrders($first: Int!, $after: String, $query: String!) {\n    orders(first: $first, after: $after, query: $query) {\n      edges {\n        node {\n          __typename\n          id\n          name\n          email\n          displayFinancialStatus\n          displayFulfillmentStatus\n          createdAt\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": {return: SearchOrdersQuery, variables: SearchOrdersQueryVariables},
  "#graphql\n  query SearchCustomers($first: Int!, $after: String, $query: String!) {\n    customers(first: $first, after: $after, query: $query) {\n      edges {\n        node {\n          __typename\n          id\n          displayName\n          email\n          numberOfOrders\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": {return: SearchCustomersQuery, variables: SearchCustomersQueryVariables},
  "#graphql\n  query SearchCollections($first: Int!, $after: String, $query: String!) {\n    collections(first: $first, after: $after, query: $query) {\n      edges {\n        node {\n          __typename\n          id\n          title\n          handle\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": {return: SearchCollectionsQuery, variables: SearchCollectionsQueryVariables},
}

interface GeneratedMutationTypes {
  "#graphql\n  mutation ProductCreate($product: ProductCreateInput!) {\n    productCreate(product: $product) {\n      product {\n        id\n        title\n        handle\n        status\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: ProductCreateMutation, variables: ProductCreateMutationVariables},
  "#graphql\n  mutation ProductUpdate($product: ProductUpdateInput!) {\n    productUpdate(product: $product) {\n      product {\n        id\n        title\n        handle\n        status\n        updatedAt\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: ProductUpdateMutation, variables: ProductUpdateMutationVariables},
  "#graphql\n  mutation InventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {\n    inventoryAdjustQuantities(input: $input) {\n      inventoryAdjustmentGroup {\n        reason\n        changes {\n          name\n          delta\n          quantityAfterChange\n          item {\n            id\n          }\n          location {\n            id\n            name\n          }\n        }\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: InventoryAdjustQuantitiesMutation, variables: InventoryAdjustQuantitiesMutationVariables},
  "#graphql\n  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {\n    metafieldsSet(metafields: $metafields) {\n      metafields {\n        id\n        namespace\n        key\n        value\n        type\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: MetafieldsSetMutation, variables: MetafieldsSetMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
