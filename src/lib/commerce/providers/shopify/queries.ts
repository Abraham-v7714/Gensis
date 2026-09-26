/**
 * Shopify Storefront API GraphQL Queries — Stage 4.6
 *
 * Provides query documents for catalog browsing, product lookup, and collection querying.
 * All query documents map directly to Storefront API schema.
 */

const MONEY_FRAGMENT = /* GraphQL */ `
  fragment moneyFields on MoneyV2 {
    amount
    currencyCode
  }
`;

const IMAGE_FRAGMENT = /* GraphQL */ `
  fragment imageFields on Image {
    id
    url
    altText
    width
    height
  }
`;

const VARIANT_FRAGMENT = /* GraphQL */ `
  ${MONEY_FRAGMENT}
  fragment variantFields on ProductVariant {
    id
    title
    sku
    availableForSale
    quantityAvailable
    price {
      ...moneyFields
    }
    selectedOptions {
      name
      value
    }
  }
`;

const PRODUCT_FRAGMENT = /* GraphQL */ `
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${VARIANT_FRAGMENT}
  fragment productFields on Product {
    id
    handle
    title
    description
    availableForSale
    priceRange {
      minVariantPrice {
        ...moneyFields
      }
    }
    images(first: 10) {
      edges {
        node {
          ...imageFields
        }
      }
    }
    options {
      id
      name
      values
    }
    variants(first: 50) {
      edges {
        node {
          ...variantFields
        }
      }
    }
  }
`;

const COLLECTION_FRAGMENT = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  fragment collectionFields on Collection {
    id
    handle
    title
    description
    image {
      ...imageFields
    }
  }
`;

export const productsQuery = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query getProducts($first: Int = 20, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          ...productFields
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const productByHandleQuery = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...productFields
    }
  }
`;

export const collectionsQuery = /* GraphQL */ `
  ${COLLECTION_FRAGMENT}
  query getCollections($first: Int = 20, $after: String) {
    collections(first: $first, after: $after) {
      edges {
        node {
          ...collectionFields
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const collectionByHandleQuery = /* GraphQL */ `
  ${COLLECTION_FRAGMENT}
  ${PRODUCT_FRAGMENT}
  query getCollectionByHandle($handle: String!, $firstProducts: Int = 20) {
    collection(handle: $handle) {
      ...collectionFields
      products(first: $firstProducts) {
        edges {
          node {
            ...productFields
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
`;

export const searchProductsQuery = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query searchProducts($query: String!, $first: Int = 20, $after: String) {
    products(first: $first, query: $query, after: $after) {
      edges {
        node {
          ...productFields
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

const USER_ERROR_FRAGMENT = /* GraphQL */ `
  fragment userErrorFields on CartUserError {
    field
    message
    code
  }
`;

const CART_LINE_FRAGMENT = /* GraphQL */ `
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${VARIANT_FRAGMENT}
  fragment cartLineFields on BaseCartLine {
    id
    quantity
    cost {
      totalAmount {
        ...moneyFields
      }
    }
    merchandise {
      ... on ProductVariant {
        ...variantFields
        product {
          id
          handle
          title
          featuredImage {
            ...imageFields
          }
        }
      }
    }
  }
`;

const CART_FRAGMENT = /* GraphQL */ `
  ${MONEY_FRAGMENT}
  ${CART_LINE_FRAGMENT}
  fragment cartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      totalAmount {
        ...moneyFields
      }
      subtotalAmount {
        ...moneyFields
      }
    }
    lines(first: 100) {
      edges {
        node {
          ...cartLineFields
        }
      }
    }
  }
`;

export const getCartQuery = /* GraphQL */ `
  ${CART_FRAGMENT}
  query getCart($id: ID!) {
    cart(id: $id) {
      ...cartFields
    }
  }
`;

export const createCartMutation = /* GraphQL */ `
  ${CART_FRAGMENT}
  ${USER_ERROR_FRAGMENT}
  mutation createCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ...cartFields
      }
      userErrors {
        ...userErrorFields
      }
      warnings {
        target
        message
        code
      }
    }
  }
`;

export const addCartLinesMutation = /* GraphQL */ `
  ${CART_FRAGMENT}
  ${USER_ERROR_FRAGMENT}
  mutation addCartLines($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...cartFields
      }
      userErrors {
        ...userErrorFields
      }
      warnings {
        target
        message
        code
      }
    }
  }
`;

export const updateCartLinesMutation = /* GraphQL */ `
  ${CART_FRAGMENT}
  ${USER_ERROR_FRAGMENT}
  mutation updateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...cartFields
      }
      userErrors {
        ...userErrorFields
      }
      warnings {
        target
        message
        code
      }
    }
  }
`;

export const removeCartLinesMutation = /* GraphQL */ `
  ${CART_FRAGMENT}
  ${USER_ERROR_FRAGMENT}
  mutation removeCartLines($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...cartFields
      }
      userErrors {
        ...userErrorFields
      }
      warnings {
        target
        message
        code
      }
    }
  }
`;

export const updateCartBuyerIdentityMutation = /* GraphQL */ `
  ${CART_FRAGMENT}
  ${USER_ERROR_FRAGMENT}
  mutation updateCartBuyerIdentity($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        ...cartFields
      }
      userErrors {
        ...userErrorFields
      }
      warnings {
        target
        message
        code
      }
    }
  }
`;


