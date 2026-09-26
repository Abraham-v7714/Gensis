/**
 * Shopify Customer Account API Response Mapper — Stage 4.11
 *
 * Transforms raw GraphQL response shapes from Shopify Customer Account API into
 * GENSIS provider-neutral domain models (CustomerProfile, Order, CustomerAddress).
 */

import type { CustomerProfile, CustomerAddress } from "@/types/customer";
import type { Order, OrderLineItem, FinancialStatus, FulfillmentStatus, OrderFulfillment } from "@/types/order";
import type { PaginatedResult } from "@/lib/commerce/types";

type RawNode = Record<string, unknown>;

export function mapShopifyAddress(rawAddress: unknown, isDefault = false): CustomerAddress {
  const node = (rawAddress as RawNode) || {};
  if (!rawAddress) {
    return {
      id: "",
      address1: "",
      city: "",
      country: "",
      zip: "",
    };
  }

  return {
    id: (node.id as string) || "",
    firstName: (node.firstName as string) || undefined,
    lastName: (node.lastName as string) || undefined,
    company: (node.company as string) || undefined,
    address1: (node.address1 as string) || "",
    address2: (node.address2 as string) || undefined,
    city: (node.city as string) || "",
    province: (node.zoneCode as string) || (node.province as string) || undefined,
    country: (node.countryCode as string) || (node.country as string) || "",
    zip: (node.zip as string) || "",
    phone: (node.phoneNumber as string) || (node.phone as string) || undefined,
    isDefault,
  };
}

export function mapShopifyCustomerProfile(rawCustomer: unknown): CustomerProfile {
  const customer = (rawCustomer as RawNode) || {};
  if (!rawCustomer) {
    return {
      id: "",
      email: "",
      addresses: [],
    };
  }

  const defaultAddr = customer.defaultAddress as RawNode | undefined;
  const defaultAddrId = defaultAddr?.id as string | undefined;
  const addressesEdge = customer.addresses as { edges?: Array<{ node?: RawNode }> } | undefined;

  const addresses: CustomerAddress[] = Array.isArray(addressesEdge?.edges)
    ? addressesEdge.edges.map((edge) =>
        mapShopifyAddress(edge?.node, Boolean(edge?.node?.id && edge.node.id === defaultAddrId))
      )
    : [];

  const emailAddr = customer.emailAddress as { address?: string } | undefined;
  const phoneObj = customer.phoneNumber as { phoneNumber?: string } | undefined;

  return {
    id: (customer.id as string) || "",
    email: emailAddr?.address || (customer.email as string) || "",
    firstName: (customer.firstName as string) || undefined,
    lastName: (customer.lastName as string) || undefined,
    phone: phoneObj?.phoneNumber || (customer.phone as string) || undefined,
    defaultAddress: defaultAddr ? mapShopifyAddress(defaultAddr, true) : undefined,
    addresses,
  };
}

function mapFinancialStatus(status?: string): FinancialStatus {
  if (!status) return "UNKNOWN";
  const s = status.toUpperCase();
  if (s.includes("PAID")) return "PAID";
  if (s.includes("PENDING")) return "PENDING";
  if (s.includes("REFUNDED")) return "REFUNDED";
  if (s.includes("AUTHORIZED")) return "AUTHORIZED";
  return "UNKNOWN";
}

function mapFulfillmentStatus(status?: string): FulfillmentStatus {
  if (!status) return "UNKNOWN";
  const s = status.toUpperCase();
  if (s.includes("FULFILLED")) return "FULFILLED";
  if (s.includes("UNFULFILLED")) return "UNFULFILLED";
  if (s.includes("PARTIAL")) return "PARTIALLY_FULFILLED";
  if (s.includes("HOLD")) return "ON_HOLD";
  return "UNKNOWN";
}

export function mapShopifyOrder(rawOrder: unknown): Order {
  const order = (rawOrder as RawNode) || {};
  if (!rawOrder) {
    return {
      id: "",
      orderNumber: "",
      processedAt: new Date().toISOString(),
      totalPrice: { amount: 0, currency: "USD" },
      lineItems: [],
    };
  }

  const lineItemsData = order.lineItems as { edges?: Array<{ node?: RawNode }> } | undefined;

  const lineItems: OrderLineItem[] = Array.isArray(lineItemsData?.edges)
    ? lineItemsData.edges.map((edge) => {
        const item = edge?.node || {};
        const priceObj = item.price as { amount?: string; currencyCode?: string } | undefined;
        const imgObj = item.image as { url?: string; altText?: string } | undefined;

        return {
          id: (item.id as string) || "",
          title: (item.title as string) || "Item",
          quantity: (item.quantity as number) || 1,
          variantTitle: (item.variantTitle as string) || undefined,
          price: {
            amount: parseFloat(priceObj?.amount || "0"),
            currency: priceObj?.currencyCode || "USD",
          },
          image: imgObj?.url
            ? {
                id: (item.id as string) || "img",
                url: imgObj.url,
                alt: imgObj.altText || (item.title as string),
              }
            : undefined,
        };
      })
    : [];

  const totalObj = order.totalPrice as { amount?: string; currencyCode?: string } | undefined;
  const subtotalObj = order.subtotalPrice as { amount?: string; currencyCode?: string } | undefined;
  const taxObj = order.totalTax as { amount?: string; currencyCode?: string } | undefined;

  const fulfillmentsData = order.fulfillments as
    | {
        edges?: Array<{
          node?: {
            id?: string;
            status?: string;
            trackingInformation?: Array<{
              number?: string;
              url?: string;
              company?: string;
            }>;
          };
        }>;
      }
    | undefined;

  const rawFulfillments: OrderFulfillment[] = [];
  if (Array.isArray(fulfillmentsData?.edges)) {
    for (const edge of fulfillmentsData.edges) {
      const node = edge?.node;
      if (node && node.id) {
        rawFulfillments.push({
          id: node.id,
          status: node.status || undefined,
          trackingInfo: Array.isArray(node.trackingInformation)
            ? node.trackingInformation.map((t) => ({
                number: t.number || undefined,
                url: t.url || undefined,
                company: t.company || undefined,
              }))
            : undefined,
        });
      }
    }
  }

  const fulfillments = rawFulfillments.length > 0 ? rawFulfillments : undefined;

  return {
    id: (order.id as string) || "",
    orderNumber: (order.number as number)?.toString() || (order.name as string) || "",
    processedAt: (order.processedAt as string) || new Date().toISOString(),
    financialStatus: mapFinancialStatus(order.financialStatus as string),
    fulfillmentStatus: mapFulfillmentStatus(order.fulfillmentStatus as string),
    totalPrice: {
      amount: parseFloat(totalObj?.amount || "0"),
      currency: totalObj?.currencyCode || "USD",
    },
    subtotalPrice: subtotalObj
      ? {
          amount: parseFloat(subtotalObj.amount || "0"),
          currency: subtotalObj.currencyCode || "USD",
        }
      : undefined,
    totalTax: taxObj
      ? {
          amount: parseFloat(taxObj.amount || "0"),
          currency: taxObj.currencyCode || "USD",
        }
      : undefined,
    lineItems,
    shippingAddress: order.shippingAddress
      ? mapShopifyAddress(order.shippingAddress)
      : undefined,
    statusUrl: (order.statusPageUrl as string) || (order.statusUrl as string) || undefined,
    fulfillments: fulfillments && fulfillments.length > 0 ? fulfillments : undefined,
  };
}

export function mapShopifyOrdersPaginated(rawCustomerOrders: unknown): PaginatedResult<Order> {
  const root = (rawCustomerOrders as RawNode) || {};
  const ordersData = root.orders as {
    edges?: Array<{ node?: RawNode }>;
    pageInfo?: {
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
      startCursor?: string;
      endCursor?: string;
    };
  } | undefined;

  if (!ordersData) {
    return {
      items: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
    };
  }

  const items: Order[] = Array.isArray(ordersData.edges)
    ? ordersData.edges.map((edge) => mapShopifyOrder(edge?.node))
    : [];

  return {
    items,
    pageInfo: {
      hasNextPage: Boolean(ordersData.pageInfo?.hasNextPage),
      hasPreviousPage: Boolean(ordersData.pageInfo?.hasPreviousPage),
      startCursor: ordersData.pageInfo?.startCursor || undefined,
      endCursor: ordersData.pageInfo?.endCursor || undefined,
    },
  };
}
