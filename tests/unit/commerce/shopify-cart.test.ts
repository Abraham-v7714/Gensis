import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ShopifyCommerceClient } from "@/lib/commerce/providers/shopify/ShopifyCommerceClient";
import * as clientModule from "@/lib/commerce/providers/shopify/client";
import * as configModule from "@/lib/commerce/providers/shopify/config";

describe("ShopifyCommerceClient Cart Operations", () => {
  let commerceClient: ShopifyCommerceClient;

  beforeEach(() => {
    vi.clearAllMocks();
    commerceClient = new ShopifyCommerceClient();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns UNAAVAILABLE error when Shopify is unconfigured", async () => {
    vi.spyOn(configModule, "isShopifyConfigured").mockReturnValue(false);

    const getRes = await commerceClient.getCart("cart-1");
    expect(getRes.ok).toBe(false);
    if (!getRes.ok) {
      expect(getRes.error.code).toBe("UNAVAILABLE");
    }

    const createRes = await commerceClient.createCart();
    expect(createRes.ok).toBe(false);
    if (!createRes.ok) {
      expect(createRes.error.code).toBe("UNAVAILABLE");
    }
  });

  it("creates a cart and maps payload correctly", async () => {
    vi.spyOn(configModule, "isShopifyConfigured").mockReturnValue(true);
    vi.spyOn(clientModule, "shopifyFetch").mockResolvedValue({
      data: {
        cartCreate: {
          cart: {
            id: "gid://shopify/Cart/123",
            checkoutUrl: "https://checkout.shopify.com/123",
            totalQuantity: 1,
            cost: {
              totalAmount: { amount: "450.00", currencyCode: "USD" },
              subtotalAmount: { amount: "450.00", currencyCode: "USD" },
            },
            lines: {
              edges: [
                {
                  node: {
                    id: "line-1",
                    quantity: 1,
                    cost: { totalAmount: { amount: "450.00", currencyCode: "USD" } },
                    merchandise: {
                      id: "var-1",
                      title: "Small",
                      price: { amount: "450.00", currencyCode: "USD" },
                      availableForSale: true,
                      selectedOptions: [{ name: "Size", value: "S" }],
                      product: {
                        id: "prod-1",
                        handle: "wool-coat",
                        title: "Wool Coat",
                        featuredImage: { url: "https://example.com/coat.jpg", altText: "Wool Coat" },
                      },
                    },
                  },
                },
              ],
            },
          },
          userErrors: [],
        },
      },
    });

    const res = await commerceClient.createCart([{ variantId: "var-1", quantity: 1 }]);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.id).toBe("gid://shopify/Cart/123");
      expect(res.data.totalQuantity).toBe(1);
      expect(res.data.lines[0].productTitle).toBe("Wool Coat");
      expect(res.data.lines[0].variant.title).toBe("Small");
    }
  });

  it("returns USER_ERROR when Shopify returns userErrors", async () => {
    vi.spyOn(configModule, "isShopifyConfigured").mockReturnValue(true);
    vi.spyOn(clientModule, "shopifyFetch").mockResolvedValue({
      data: {
        cartLinesAdd: {
          cart: null,
          userErrors: [{ message: "The selected variant is sold out.", field: ["lines", "0"] }],
        },
      },
    });

    const res = await commerceClient.addCartLines("cart-123", [{ variantId: "var-soldout", quantity: 1 }]);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("USER_ERROR");
      expect(res.error.message).toBe("The selected variant is sold out.");
    }
  });

  it("returns PROVIDER_ERROR when GraphQL errors occur", async () => {
    vi.spyOn(configModule, "isShopifyConfigured").mockReturnValue(true);
    vi.spyOn(clientModule, "shopifyFetch").mockResolvedValue({
      errors: [{ message: "Internal server error" }],
    });

    const res = await commerceClient.getCart("cart-123");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("PROVIDER_ERROR");
    }
  });
});
