import { describe, it, expect } from "vitest";
import {
  mapShopifyCustomerProfile,
  mapShopifyOrder,
  mapShopifyOrdersPaginated,
} from "@/lib/commerce/providers/shopify/customerMapper";

describe("Customer Account API Mapper", () => {
  it("maps raw customer profile data correctly", () => {
    const rawCustomer = {
      id: "gid://shopify/Customer/101",
      firstName: "Jane",
      lastName: "Doe",
      emailAddress: { address: "jane@example.com" },
      phoneNumber: { phoneNumber: "+15551234567" },
      defaultAddress: {
        id: "gid://shopify/CustomerAddress/1",
        firstName: "Jane",
        lastName: "Doe",
        address1: "123 High St",
        city: "New York",
        zoneCode: "NY",
        countryCode: "US",
        zip: "10001",
      },
      addresses: {
        edges: [
          {
            node: {
              id: "gid://shopify/CustomerAddress/1",
              address1: "123 High St",
              city: "New York",
              countryCode: "US",
              zip: "10001",
            },
          },
        ],
      },
    };

    const profile = mapShopifyCustomerProfile(rawCustomer);

    expect(profile.id).toBe("gid://shopify/Customer/101");
    expect(profile.email).toBe("jane@example.com");
    expect(profile.firstName).toBe("Jane");
    expect(profile.lastName).toBe("Doe");
    expect(profile.phone).toBe("+15551234567");
    expect(profile.defaultAddress?.address1).toBe("123 High St");
    expect(profile.addresses.length).toBe(1);
    expect(profile.addresses[0].isDefault).toBe(true);
  });

  it("maps raw order data correctly", () => {
    const rawOrder = {
      id: "gid://shopify/Order/201",
      number: 1001,
      name: "#1001",
      processedAt: "2026-09-20T10:00:00Z",
      financialStatus: "PAID",
      fulfillmentStatus: "FULFILLED",
      totalPrice: { amount: "450.00", currencyCode: "USD" },
      subtotalPrice: { amount: "450.00", currencyCode: "USD" },
      lineItems: {
        edges: [
          {
            node: {
              id: "line-1",
              title: "Architectural Coat",
              quantity: 1,
              variantTitle: "Black / M",
              price: { amount: "450.00", currencyCode: "USD" },
            },
          },
        ],
      },
    };

    const order = mapShopifyOrder(rawOrder);

    expect(order.id).toBe("gid://shopify/Order/201");
    expect(order.orderNumber).toBe("1001");
    expect(order.financialStatus).toBe("PAID");
    expect(order.fulfillmentStatus).toBe("FULFILLED");
    expect(order.totalPrice.amount).toBe(450);
    expect(order.lineItems.length).toBe(1);
    expect(order.lineItems[0].title).toBe("Architectural Coat");
  });

  it("maps raw customer orders list paginated result correctly", () => {
    const rawPayload = {
      orders: {
        edges: [
          {
            node: {
              id: "gid://shopify/Order/201",
              number: 1001,
              processedAt: "2026-09-20T10:00:00Z",
              totalPrice: { amount: "450.00", currencyCode: "USD" },
            },
          },
        ],
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          endCursor: "cursor-1",
        },
      },
    };

    const paginated = mapShopifyOrdersPaginated(rawPayload);

    expect(paginated.items.length).toBe(1);
    expect(paginated.pageInfo.hasNextPage).toBe(true);
    expect(paginated.pageInfo.endCursor).toBe("cursor-1");
  });
});
