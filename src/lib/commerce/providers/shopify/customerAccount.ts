/**
 * Shopify Customer Account API Client Boundary — Stage 4.11
 *
 * Provider-specific client executing authenticated queries against the Shopify
 * Customer Account API endpoint (https://<store_domain>/account/customer/api/2026-07/graphql.json).
 *
 * Security:
 * - Accepts only valid server-side access tokens.
 * - No client component imports.
 * - Disables shared HTTP caching for protected customer data.
 */

import { getShopifyStoreDomain } from "./config";
import {
  customerProfileQuery,
  customerOrdersQuery,
  orderByIdQuery,
  customerAddressCreateMutation,
  customerAddressUpdateMutation,
  customerAddressDeleteMutation,
  customerDefaultAddressUpdateMutation,
} from "./customerQueries";
import {
  mapShopifyCustomerProfile,
  mapShopifyOrdersPaginated,
  mapShopifyOrder,
  mapShopifyAddress,
} from "./customerMapper";
import type { CustomerProfile, CustomerAddress } from "@/types/customer";
import type { Order } from "@/types/order";
import type { PaginatedResult, CommerceResult } from "@/lib/commerce/types";

function formatAddressInput(address: Partial<CustomerAddress>) {
  return {
    address1: address.address1,
    address2: address.address2 || undefined,
    city: address.city,
    company: address.company || undefined,
    countryCode: address.country,
    firstName: address.firstName || undefined,
    lastName: address.lastName || undefined,
    phoneNumber: address.phone || undefined,
    zip: address.zip,
    zoneCode: address.province || undefined,
  };
}

export class ShopifyCustomerAccountClient {
  private getEndpoint(): string {
    const domain = getShopifyStoreDomain();
    return `https://${domain}/account/customer/api/2026-07/graphql.json`;
  }

  private async fetchGraphQL<T>(
    accessToken: string,
    query: string,
    variables?: Record<string, unknown>
  ): Promise<CommerceResult<T>> {
    if (!accessToken || typeof accessToken !== "string") {
      return {
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "Customer access token is required." },
      };
    }

    try {
      const res = await fetch(this.getEndpoint(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken,
        },
        body: JSON.stringify({ query, variables }),
        cache: "no-store", // Never cache protected customer data
      });

      if (!res.ok) {
        return {
          ok: false,
          error: {
            code: "PROVIDER_ERROR",
            message: `Customer Account API request failed with status ${res.status}`,
          },
        };
      }

      const json = (await res.json()) as { data?: T; errors?: Array<{ message?: string }> };

      if (json.errors && json.errors.length > 0) {
        return {
          ok: false,
          error: {
            code: "PROVIDER_ERROR",
            message: json.errors[0]?.message || "GraphQL error from Customer Account API",
          },
        };
      }

      if (!json.data) {
        return {
          ok: false,
          error: {
            code: "PROVIDER_ERROR",
            message: "Customer Account API returned empty data payload.",
          },
        };
      }

      return { ok: true, data: json.data };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: "PROVIDER_ERROR",
          message: `Network failure connecting to Customer Account API: ${(error as Error).message}`,
        },
      };
    }
  }

  async getCustomerProfile(accessToken: string): Promise<CommerceResult<CustomerProfile>> {
    const result = await this.fetchGraphQL<{ customer?: unknown }>(
      accessToken,
      customerProfileQuery
    );

    if (!result.ok) {
      return result;
    }

    const profile = mapShopifyCustomerProfile(result.data.customer);
    return { ok: true, data: profile };
  }

  async getCustomerOrders(
    accessToken: string,
    options?: { first?: number; after?: string }
  ): Promise<PaginatedResult<Order>> {
    const result = await this.fetchGraphQL<{ customer?: unknown }>(
      accessToken,
      customerOrdersQuery,
      {
        first: options?.first || 20,
        after: options?.after,
      }
    );

    if (!result.ok) {
      return {
        items: [],
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
        error: true,
      };
    }

    return mapShopifyOrdersPaginated(result.data.customer);
  }

  async getOrderById(accessToken: string, orderId: string): Promise<CommerceResult<Order>> {
    const result = await this.fetchGraphQL<{ order?: unknown }>(
      accessToken,
      orderByIdQuery,
      { id: orderId }
    );

    if (!result.ok) {
      return result;
    }

    if (!result.data.order) {
      return {
        ok: false,
        error: { code: "NOT_FOUND", message: "Order not found." },
      };
    }

    const order = mapShopifyOrder(result.data.order);
    return { ok: true, data: order };
  }

  async createAddress(
    accessToken: string,
    address: Omit<CustomerAddress, "id">
  ): Promise<CommerceResult<CustomerAddress>> {
    const input = formatAddressInput(address);
    const result = await this.fetchGraphQL<{
      customerAddressCreate?: {
        customerAddress?: unknown;
        userErrors?: Array<{ message?: string }>;
      };
    }>(accessToken, customerAddressCreateMutation, { address: input });

    if (!result.ok) {
      return result;
    }

    const payload = result.data.customerAddressCreate;
    if (payload?.userErrors && payload.userErrors.length > 0) {
      return {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: payload.userErrors[0]?.message || "Failed to create address.",
        },
      };
    }

    if (!payload?.customerAddress) {
      return {
        ok: false,
        error: { code: "PROVIDER_ERROR", message: "Address creation returned no data." },
      };
    }

    const created = mapShopifyAddress(payload.customerAddress, Boolean(address.isDefault));
    return { ok: true, data: created };
  }

  async updateAddress(
    accessToken: string,
    addressId: string,
    address: Partial<CustomerAddress>
  ): Promise<CommerceResult<CustomerAddress>> {
    const input = formatAddressInput(address);
    const result = await this.fetchGraphQL<{
      customerAddressUpdate?: {
        customerAddress?: unknown;
        userErrors?: Array<{ message?: string }>;
      };
    }>(accessToken, customerAddressUpdateMutation, { addressId, address: input });

    if (!result.ok) {
      return result;
    }

    const payload = result.data.customerAddressUpdate;
    if (payload?.userErrors && payload.userErrors.length > 0) {
      return {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: payload.userErrors[0]?.message || "Failed to update address.",
        },
      };
    }

    if (!payload?.customerAddress) {
      return {
        ok: false,
        error: { code: "PROVIDER_ERROR", message: "Address update returned no data." },
      };
    }

    const updated = mapShopifyAddress(payload.customerAddress, Boolean(address.isDefault));
    return { ok: true, data: updated };
  }

  async deleteAddress(
    accessToken: string,
    addressId: string
  ): Promise<CommerceResult<boolean>> {
    const result = await this.fetchGraphQL<{
      customerAddressDelete?: {
        deletedAddressId?: string;
        userErrors?: Array<{ message?: string }>;
      };
    }>(accessToken, customerAddressDeleteMutation, { addressId });

    if (!result.ok) {
      return result;
    }

    const payload = result.data.customerAddressDelete;
    if (payload?.userErrors && payload.userErrors.length > 0) {
      return {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: payload.userErrors[0]?.message || "Failed to delete address.",
        },
      };
    }

    return { ok: true, data: true };
  }

  async setDefaultAddress(
    accessToken: string,
    addressId: string
  ): Promise<CommerceResult<CustomerAddress>> {
    const result = await this.fetchGraphQL<{
      customerDefaultAddressUpdate?: {
        customer?: { defaultAddress?: unknown };
        userErrors?: Array<{ message?: string }>;
      };
    }>(accessToken, customerDefaultAddressUpdateMutation, { addressId });

    if (!result.ok) {
      return result;
    }

    const payload = result.data.customerDefaultAddressUpdate;
    if (payload?.userErrors && payload.userErrors.length > 0) {
      return {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: payload.userErrors[0]?.message || "Failed to set default address.",
        },
      };
    }

    const defaultAddr = payload?.customer?.defaultAddress;
    if (!defaultAddr) {
      return {
        ok: false,
        error: { code: "PROVIDER_ERROR", message: "Default address update returned no data." },
      };
    }

    return { ok: true, data: mapShopifyAddress(defaultAddr, true) };
  }
}

export const customerAccountClient = new ShopifyCustomerAccountClient();
