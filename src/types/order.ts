/**
 * Order Domain Model — Stage 4.11
 *
 * Provider-neutral domain models for customer order history and order line items.
 */

import type { Money } from "./common";
import type { ProductImage } from "./product";
import type { CustomerAddress } from "./customer";

export type FulfillmentStatus =
  | "FULFILLED"
  | "UNFULFILLED"
  | "PARTIALLY_FULFILLED"
  | "SCHEDULED"
  | "ON_HOLD"
  | "UNKNOWN";

export type FinancialStatus =
  | "PAID"
  | "PENDING"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "AUTHORIZED"
  | "VOIDED"
  | "EXPIRED"
  | "UNKNOWN";

export type OrderLineItem = {
  id: string;
  title: string;
  quantity: number;
  variantTitle?: string;
  price: Money;
  image?: ProductImage;
};

export type FulfillmentTrackingInfo = {
  number?: string;
  url?: string;
  company?: string;
};

export type OrderFulfillment = {
  id: string;
  status?: string;
  trackingInfo?: FulfillmentTrackingInfo[];
};

export type Order = {
  id: string;
  orderNumber: string;
  processedAt: string;
  financialStatus?: FinancialStatus;
  fulfillmentStatus?: FulfillmentStatus;
  totalPrice: Money;
  subtotalPrice?: Money;
  totalTax?: Money;
  lineItems: OrderLineItem[];
  shippingAddress?: CustomerAddress;
  statusUrl?: string;
  fulfillments?: OrderFulfillment[];
};
