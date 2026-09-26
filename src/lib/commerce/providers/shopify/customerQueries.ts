/**
 * Shopify Customer Account API GraphQL Queries & Mutations — Stage 4.11
 *
 * Endpoint: https://<store_domain>/account/customer/api/2026-07/graphql.json
 * Authorization Header: Authorization: <accessToken>
 */

const ADDRESS_FRAGMENT = /* GraphQL */ `
  fragment addressFields on CustomerAddress {
    id
    firstName
    lastName
    company
    address1
    address2
    city
    zoneCode
    countryCode
    zip
    phoneNumber
  }
`;

export const customerProfileQuery = /* GraphQL */ `
  ${ADDRESS_FRAGMENT}
  query getCustomerProfile {
    customer {
      id
      firstName
      lastName
      emailAddress {
        address
      }
      phoneNumber {
        phoneNumber
      }
      defaultAddress {
        ...addressFields
      }
      addresses(first: 50) {
        edges {
          node {
            ...addressFields
          }
        }
      }
    }
  }
`;

export const customerOrdersQuery = /* GraphQL */ `
  query getCustomerOrders($first: Int = 20, $after: String) {
    customer {
      orders(first: $first, after: $after) {
        edges {
          node {
            id
            name
            number
            processedAt
            financialStatus
            fulfillmentStatus
            totalPrice {
              amount
              currencyCode
            }
            subtotalPrice {
              amount
              currencyCode
            }
            totalTax {
              amount
              currencyCode
            }
            lineItems(first: 50) {
              edges {
                node {
                  id
                  title
                  quantity
                  variantTitle
                  price {
                    amount
                    currencyCode
                  }
                  image {
                    url
                    altText
                  }
                }
              }
            }
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

export const orderByIdQuery = /* GraphQL */ `
  ${ADDRESS_FRAGMENT}
  query getOrderById($id: ID!) {
    order(id: $id) {
      id
      name
      number
      processedAt
      financialStatus
      fulfillmentStatus
      statusPageUrl
      totalPrice {
        amount
        currencyCode
      }
      subtotalPrice {
        amount
        currencyCode
      }
      totalTax {
        amount
        currencyCode
      }
      shippingAddress {
        ...addressFields
      }
      fulfillments(first: 10) {
        edges {
          node {
            id
            status
            trackingInformation {
              number
              url
              company
            }
          }
        }
      }
      lineItems(first: 50) {
        edges {
          node {
            id
            title
            quantity
            variantTitle
            price {
              amount
              currencyCode
            }
            image {
              url
              altText
            }
          }
        }
      }
    }
  }
`;

export const customerAddressCreateMutation = /* GraphQL */ `
  ${ADDRESS_FRAGMENT}
  mutation customerAddressCreate($address: CustomerAddressInput!) {
    customerAddressCreate(address: $address) {
      customerAddress {
        ...addressFields
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

export const customerAddressUpdateMutation = /* GraphQL */ `
  ${ADDRESS_FRAGMENT}
  mutation customerAddressUpdate($addressId: ID!, $address: CustomerAddressInput!) {
    customerAddressUpdate(addressId: $addressId, address: $address) {
      customerAddress {
        ...addressFields
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

export const customerAddressDeleteMutation = /* GraphQL */ `
  mutation customerAddressDelete($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors {
        code
        field
        message
      }
    }
  }
`;

export const customerDefaultAddressUpdateMutation = /* GraphQL */ `
  ${ADDRESS_FRAGMENT}
  mutation customerDefaultAddressUpdate($addressId: ID!) {
    customerDefaultAddressUpdate(addressId: $addressId) {
      customer {
        id
        defaultAddress {
          ...addressFields
        }
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;
