import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ShopifyCommerceClient } from "@/lib/commerce/providers/shopify/ShopifyCommerceClient";
import * as clientModule from "@/lib/commerce/providers/shopify/client";
import * as configModule from "@/lib/commerce/providers/shopify/config";

describe("ShopifyCommerceClient Implementation", () => {
  let commerceClient: ShopifyCommerceClient;

  beforeEach(() => {
    vi.clearAllMocks();
    commerceClient = new ShopifyCommerceClient();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns empty arrays / null when Shopify is unconfigured", async () => {
    vi.spyOn(configModule, "isShopifyConfigured").mockReturnValue(false);

    const products = await commerceClient.getProducts();
    expect(products.items).toEqual([]);
    expect(products.pageInfo).toEqual({ hasNextPage: false, hasPreviousPage: false, startCursor: undefined, endCursor: undefined });

    const product = await commerceClient.getProductBySlug("test-slug");
    expect(product).toBeNull();

    const collections = await commerceClient.getCollections();
    expect(collections.items).toEqual([]);
    expect(collections.pageInfo).toEqual({ hasNextPage: false, hasPreviousPage: false, startCursor: undefined, endCursor: undefined });

    const collection = await commerceClient.getCollectionBySlug("test-slug");
    expect(collection).toBeNull();

    const searchResults = await commerceClient.searchProducts("jacket");
    expect(searchResults.items).toEqual([]);
    expect(searchResults.pageInfo).toEqual({ hasNextPage: false, hasPreviousPage: false, startCursor: undefined, endCursor: undefined });
  });

  it("fetches and maps product list successfully when configured", async () => {
    vi.spyOn(configModule, "isShopifyConfigured").mockReturnValue(true);

    vi.spyOn(clientModule, "shopifyFetch").mockResolvedValue({
      data: {
        products: {
          edges: [
            {
              node: {
                id: "gid://shopify/Product/1",
                handle: "wool-trouser",
                title: "Wool Trouser",
                description: "Pleated wool trouser",
                availableForSale: true,
                priceRange: { minVariantPrice: { amount: "320.00", currencyCode: "USD" } },
                images: { edges: [] },
                variants: { edges: [] },
              },
            },
          ],
        },
      },
    });

    const products = await commerceClient.getProducts();

    expect(products.items).toHaveLength(1);
    expect(products.items[0].slug).toBe("wool-trouser");
    expect(products.items[0].title).toBe("Wool Trouser");
    expect(products.items[0].price).toEqual({ amount: 320, currency: "USD" });
  });

  it("fetches single product by slug successfully", async () => {
    vi.spyOn(configModule, "isShopifyConfigured").mockReturnValue(true);

    vi.spyOn(clientModule, "shopifyFetch").mockResolvedValue({
      data: {
        product: {
          id: "gid://shopify/Product/2",
          handle: "silk-shirt",
          title: "Silk Shirt",
          description: "Raw silk button-up",
          availableForSale: true,
          priceRange: { minVariantPrice: { amount: "280.00", currencyCode: "USD" } },
        },
      },
    });

    const product = await commerceClient.getProductBySlug("silk-shirt");

    expect(product).not.toBeNull();
    expect(product?.slug).toBe("silk-shirt");
    expect(product?.title).toBe("Silk Shirt");
  });

  it("handles GraphQL errors gracefully without throwing", async () => {
    vi.spyOn(configModule, "isShopifyConfigured").mockReturnValue(true);
    vi.spyOn(clientModule, "shopifyFetch").mockResolvedValue({
      errors: [{ message: "Field 'invalid' does not exist" }],
    });

    const products = await commerceClient.getProducts();
    expect(products.items).toEqual([]);
    expect(products.error).toBe(true);
  });
});
