/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontTypes from './storefront.types.d.ts';

export type StorefrontCreateCartMutationVariables = StorefrontTypes.Exact<{
  input: StorefrontTypes.CartInput;
}>;


export type StorefrontCreateCartMutation = { cartCreate?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl' | 'totalQuantity'>
      & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalTaxAmount?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>> }, lines: { edges: Array<{ node: (
            Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
            & { merchandise: (
              Pick<StorefrontTypes.ProductVariant, 'id' | 'title'>
              & { product: Pick<StorefrontTypes.Product, 'title' | 'handle'>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText'>> }
            ) }
          ) | (
            Pick<StorefrontTypes.ComponentizableCartLine, 'id' | 'quantity'>
            & { merchandise: (
              Pick<StorefrontTypes.ProductVariant, 'id' | 'title'>
              & { product: Pick<StorefrontTypes.Product, 'title' | 'handle'>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText'>> }
            ) }
          ) }> } }
    )>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'field' | 'message'>> }> };

export type StorefrontGetCartQueryVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
}>;


export type StorefrontGetCartQuery = { cart?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl' | 'totalQuantity'>
    & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalTaxAmount?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>> }, lines: { edges: Array<{ node: (
          Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
          & { merchandise: (
            Pick<StorefrontTypes.ProductVariant, 'id' | 'title'>
            & { product: Pick<StorefrontTypes.Product, 'title' | 'handle'>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText'>> }
          ) }
        ) | (
          Pick<StorefrontTypes.ComponentizableCartLine, 'id' | 'quantity'>
          & { merchandise: (
            Pick<StorefrontTypes.ProductVariant, 'id' | 'title'>
            & { product: Pick<StorefrontTypes.Product, 'title' | 'handle'>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText'>> }
          ) }
        ) }> }, buyerIdentity: Pick<StorefrontTypes.CartBuyerIdentity, 'email' | 'phone' | 'countryCode'> }
  )> };

export type StorefrontAddCartLinesMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  lines: Array<StorefrontTypes.CartLineInput> | StorefrontTypes.CartLineInput;
}>;


export type StorefrontAddCartLinesMutation = { cartLinesAdd?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.Cart, 'id' | 'totalQuantity'>
      & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, lines: { edges: Array<{ node: (
            Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
            & { merchandise: Pick<StorefrontTypes.ProductVariant, 'id' | 'title'> }
          ) | (
            Pick<StorefrontTypes.ComponentizableCartLine, 'id' | 'quantity'>
            & { merchandise: Pick<StorefrontTypes.ProductVariant, 'id' | 'title'> }
          ) }> } }
    )>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'field' | 'message'>> }> };

export type StorefrontUpdateCartLinesMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  lines: Array<StorefrontTypes.CartLineUpdateInput> | StorefrontTypes.CartLineUpdateInput;
}>;


export type StorefrontUpdateCartLinesMutation = { cartLinesUpdate?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.Cart, 'id' | 'totalQuantity'>
      & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, lines: { edges: Array<{ node: Pick<StorefrontTypes.CartLine, 'id' | 'quantity'> | Pick<StorefrontTypes.ComponentizableCartLine, 'id' | 'quantity'> }> } }
    )>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'field' | 'message'>> }> };

export type StorefrontRemoveCartLinesMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  lineIds: Array<StorefrontTypes.Scalars['ID']['input']> | StorefrontTypes.Scalars['ID']['input'];
}>;


export type StorefrontRemoveCartLinesMutation = { cartLinesRemove?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.Cart, 'id' | 'totalQuantity'>
      & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> } }
    )>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'field' | 'message'>> }> };

export type StorefrontGetCollectionsQueryVariables = StorefrontTypes.Exact<{
  first: StorefrontTypes.Scalars['Int']['input'];
  after?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
}>;


export type StorefrontGetCollectionsQuery = { collections: { edges: Array<(
      Pick<StorefrontTypes.CollectionEdge, 'cursor'>
      & { node: (
        Pick<StorefrontTypes.Collection, 'id' | 'title' | 'handle' | 'description'>
        & { image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, products: { edges: Array<{ node: (
              Pick<StorefrontTypes.Product, 'id' | 'title' | 'handle'>
              & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText'>>, priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> } }
            ) }> } }
      ) }
    )>, pageInfo: Pick<StorefrontTypes.PageInfo, 'hasNextPage' | 'endCursor'> } };

export type StorefrontGetCollectionByHandleQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
  first: StorefrontTypes.Scalars['Int']['input'];
  after?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
}>;


export type StorefrontGetCollectionByHandleQuery = { collectionByHandle?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Collection, 'id' | 'title' | 'handle' | 'description' | 'descriptionHtml'>
    & { image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, products: { edges: Array<(
        Pick<StorefrontTypes.ProductEdge, 'cursor'>
        & { node: (
          Pick<StorefrontTypes.Product, 'id' | 'title' | 'handle' | 'description' | 'availableForSale'>
          & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: (
                Pick<StorefrontTypes.ProductVariant, 'id'>
                & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
              ) }> } }
        ) }
      )>, pageInfo: Pick<StorefrontTypes.PageInfo, 'hasNextPage' | 'endCursor'> } }
  )> };

export type StorefrontGetProductsQueryVariables = StorefrontTypes.Exact<{
  first: StorefrontTypes.Scalars['Int']['input'];
  after?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
  query?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
}>;


export type StorefrontGetProductsQuery = { products: { edges: Array<(
      Pick<StorefrontTypes.ProductEdge, 'cursor'>
      & { node: (
        Pick<StorefrontTypes.Product, 'id' | 'title' | 'handle' | 'description' | 'productType' | 'vendor' | 'tags' | 'availableForSale'>
        & { priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, compareAtPriceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'> }> }, variants: { edges: Array<{ node: (
              Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
              & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtPrice?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>> }
            ) }> } }
      ) }
    )>, pageInfo: Pick<StorefrontTypes.PageInfo, 'hasNextPage' | 'endCursor'> } };

export type StorefrontGetProductByHandleQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
}>;


export type StorefrontGetProductByHandleQuery = { productByHandle?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Product, 'id' | 'title' | 'handle' | 'description' | 'descriptionHtml' | 'productType' | 'vendor' | 'tags' | 'availableForSale'>
    & { options: Array<Pick<StorefrontTypes.ProductOption, 'id' | 'name' | 'values'>>, priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'> }> }, variants: { edges: Array<{ node: (
          Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale' | 'quantityAvailable'>
          & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtPrice?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>>, selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText'>> }
        ) }> }, metafields: Array<StorefrontTypes.Maybe<Pick<StorefrontTypes.Metafield, 'key' | 'namespace' | 'value' | 'type'>>> }
  )> };

interface GeneratedQueryTypes {
  "#graphql\n  query StorefrontGetCart($cartId: ID!) {\n    cart(id: $cartId) {\n      id\n      checkoutUrl\n      totalQuantity\n      cost {\n        totalAmount {\n          amount\n          currencyCode\n        }\n        subtotalAmount {\n          amount\n          currencyCode\n        }\n        totalTaxAmount {\n          amount\n          currencyCode\n        }\n      }\n      lines(first: 100) {\n        edges {\n          node {\n            id\n            quantity\n            merchandise {\n              ... on ProductVariant {\n                id\n                title\n                product {\n                  title\n                  handle\n                }\n                price {\n                  amount\n                  currencyCode\n                }\n                image {\n                  url\n                  altText\n                }\n              }\n            }\n          }\n        }\n      }\n      buyerIdentity {\n        email\n        phone\n        countryCode\n      }\n    }\n  }\n": {return: StorefrontGetCartQuery, variables: StorefrontGetCartQueryVariables},
  "#graphql\n  query StorefrontGetCollections($first: Int!, $after: String) {\n    collections(first: $first, after: $after) {\n      edges {\n        node {\n          id\n          title\n          handle\n          description\n          image {\n            url\n            altText\n            width\n            height\n          }\n          products(first: 4) {\n            edges {\n              node {\n                id\n                title\n                handle\n                featuredImage {\n                  url\n                  altText\n                }\n                priceRange {\n                  minVariantPrice {\n                    amount\n                    currencyCode\n                  }\n                }\n              }\n            }\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": {return: StorefrontGetCollectionsQuery, variables: StorefrontGetCollectionsQueryVariables},
  "#graphql\n  query StorefrontGetCollectionByHandle($handle: String!, $first: Int!, $after: String) {\n    collectionByHandle(handle: $handle) {\n      id\n      title\n      handle\n      description\n      descriptionHtml\n      image {\n        url\n        altText\n        width\n        height\n      }\n      products(first: $first, after: $after) {\n        edges {\n          node {\n            id\n            title\n            handle\n            description\n            availableForSale\n            featuredImage {\n              url\n              altText\n              width\n              height\n            }\n            priceRange {\n              minVariantPrice {\n                amount\n                currencyCode\n              }\n              maxVariantPrice {\n                amount\n                currencyCode\n              }\n            }\n            variants(first: 1) {\n              edges {\n                node {\n                  id\n                  price {\n                    amount\n                    currencyCode\n                  }\n                }\n              }\n            }\n          }\n          cursor\n        }\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n  }\n": {return: StorefrontGetCollectionByHandleQuery, variables: StorefrontGetCollectionByHandleQueryVariables},
  "#graphql\n  query StorefrontGetProducts($first: Int!, $after: String, $query: String) {\n    products(first: $first, after: $after, query: $query) {\n      edges {\n        node {\n          id\n          title\n          handle\n          description\n          productType\n          vendor\n          tags\n          availableForSale\n          priceRange {\n            minVariantPrice {\n              amount\n              currencyCode\n            }\n            maxVariantPrice {\n              amount\n              currencyCode\n            }\n          }\n          compareAtPriceRange {\n            minVariantPrice {\n              amount\n              currencyCode\n            }\n            maxVariantPrice {\n              amount\n              currencyCode\n            }\n          }\n          images(first: 5) {\n            edges {\n              node {\n                url\n                altText\n                width\n                height\n              }\n            }\n          }\n          variants(first: 10) {\n            edges {\n              node {\n                id\n                title\n                availableForSale\n                price {\n                  amount\n                  currencyCode\n                }\n                compareAtPrice {\n                  amount\n                  currencyCode\n                }\n              }\n            }\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": {return: StorefrontGetProductsQuery, variables: StorefrontGetProductsQueryVariables},
  "#graphql\n  query StorefrontGetProductByHandle($handle: String!) {\n    productByHandle(handle: $handle) {\n      id\n      title\n      handle\n      description\n      descriptionHtml\n      productType\n      vendor\n      tags\n      availableForSale\n      options {\n        id\n        name\n        values\n      }\n      priceRange {\n        minVariantPrice {\n          amount\n          currencyCode\n        }\n        maxVariantPrice {\n          amount\n          currencyCode\n        }\n      }\n      images(first: 20) {\n        edges {\n          node {\n            url\n            altText\n            width\n            height\n          }\n        }\n      }\n      variants(first: 100) {\n        edges {\n          node {\n            id\n            title\n            availableForSale\n            quantityAvailable\n            price {\n              amount\n              currencyCode\n            }\n            compareAtPrice {\n              amount\n              currencyCode\n            }\n            selectedOptions {\n              name\n              value\n            }\n            image {\n              url\n              altText\n            }\n          }\n        }\n      }\n      metafields(identifiers: []) {\n        key\n        namespace\n        value\n        type\n      }\n    }\n  }\n": {return: StorefrontGetProductByHandleQuery, variables: StorefrontGetProductByHandleQueryVariables},
}

interface GeneratedMutationTypes {
  "#graphql\n  mutation StorefrontCreateCart($input: CartInput!) {\n    cartCreate(input: $input) {\n      cart {\n        id\n        checkoutUrl\n        totalQuantity\n        cost {\n          totalAmount {\n            amount\n            currencyCode\n          }\n          subtotalAmount {\n            amount\n            currencyCode\n          }\n          totalTaxAmount {\n            amount\n            currencyCode\n          }\n        }\n        lines(first: 100) {\n          edges {\n            node {\n              id\n              quantity\n              merchandise {\n                ... on ProductVariant {\n                  id\n                  title\n                  product {\n                    title\n                    handle\n                  }\n                  price {\n                    amount\n                    currencyCode\n                  }\n                  image {\n                    url\n                    altText\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: StorefrontCreateCartMutation, variables: StorefrontCreateCartMutationVariables},
  "#graphql\n  mutation StorefrontAddCartLines($cartId: ID!, $lines: [CartLineInput!]!) {\n    cartLinesAdd(cartId: $cartId, lines: $lines) {\n      cart {\n        id\n        totalQuantity\n        cost {\n          totalAmount {\n            amount\n            currencyCode\n          }\n        }\n        lines(first: 100) {\n          edges {\n            node {\n              id\n              quantity\n              merchandise {\n                ... on ProductVariant {\n                  id\n                  title\n                }\n              }\n            }\n          }\n        }\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: StorefrontAddCartLinesMutation, variables: StorefrontAddCartLinesMutationVariables},
  "#graphql\n  mutation StorefrontUpdateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {\n    cartLinesUpdate(cartId: $cartId, lines: $lines) {\n      cart {\n        id\n        totalQuantity\n        cost {\n          totalAmount {\n            amount\n            currencyCode\n          }\n        }\n        lines(first: 100) {\n          edges {\n            node {\n              id\n              quantity\n            }\n          }\n        }\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: StorefrontUpdateCartLinesMutation, variables: StorefrontUpdateCartLinesMutationVariables},
  "#graphql\n  mutation StorefrontRemoveCartLines($cartId: ID!, $lineIds: [ID!]!) {\n    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {\n      cart {\n        id\n        totalQuantity\n        cost {\n          totalAmount {\n            amount\n            currencyCode\n          }\n        }\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: StorefrontRemoveCartLinesMutation, variables: StorefrontRemoveCartLinesMutationVariables},
}
declare module '@shopify/storefront-api-client' {
  type InputMaybe<T> = StorefrontTypes.InputMaybe<T>;
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
