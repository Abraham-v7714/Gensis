import { describe, it, expect } from "vitest";
import {
  mapShopifyMoney,
  mapShopifyAvailability,
  mapShopifyImage,
  mapShopifyVariant,
  mapShopifyProduct,
  mapShopifyCollection,
  type RawShopifyProductNode,
  type RawShopifyCollectionNode,
} from "@/lib/commerce/providers/shopify/mapper";

describe("Shopify Mapper Boundary", () => {
  // ── MONEY MAPPING ─────────────────────────────────────────────────────────

  describe("mapShopifyMoney", () => {
    it("maps string amounts to numeric Money domain objects", () => {
      const money = mapShopifyMoney({ amount: "245.00", currencyCode: "USD" });
      expect(money).toEqual({ amount: 245, currency: "USD" });
    });

    it("handles missing or invalid amount gracefully", () => {
      const money = mapShopifyMoney(null);
      expect(money).toEqual({ amount: 0, currency: "USD" });
    });
  });

  // ── AVAILABILITY MAPPING ──────────────────────────────────────────────────

  describe("mapShopifyAvailability", () => {
    it("maps availableForSale = true to 'available'", () => {
      expect(mapShopifyAvailability(true)).toBe("available");
    });

    it("maps availableForSale = false to 'sold-out'", () => {
      expect(mapShopifyAvailability(false)).toBe("sold-out");
    });

    it("maps quantityAvailable = 0 to 'sold-out'", () => {
      expect(mapShopifyAvailability(true, 0)).toBe("sold-out");
    });

    it("maps null/undefined state to 'unavailable'", () => {
      expect(mapShopifyAvailability(null)).toBe("unavailable");
    });
  });

  // ── IMAGE MAPPING ─────────────────────────────────────────────────────────

  describe("mapShopifyImage", () => {
    it("maps Shopify image object to ProductImage domain model", () => {
      const img = mapShopifyImage({
        id: "gid://shopify/ProductImage/123",
        url: "https://cdn.shopify.com/image.jpg",
        altText: "Architectural Wool Coat",
        width: 1200,
        height: 1600,
      });

      expect(img).toEqual({
        id: "gid://shopify/ProductImage/123",
        url: "https://cdn.shopify.com/image.jpg",
        alt: "Architectural Wool Coat",
        width: 1200,
        height: 1600,
      });
    });

    it("returns null when url is missing", () => {
      expect(mapShopifyImage(null)).toBeNull();
      expect(mapShopifyImage({})).toBeNull();
    });
  });

  // ── VARIANT MAPPING ───────────────────────────────────────────────────────

  describe("mapShopifyVariant", () => {
    it("maps Shopify ProductVariant node to ProductVariant domain model", () => {
      const variant = mapShopifyVariant({
        id: "gid://shopify/ProductVariant/456",
        title: "Black / 48",
        sku: "GEN-COAT-01-BLK-48",
        availableForSale: true,
        price: { amount: "490.00", currencyCode: "EUR" },
        selectedOptions: [
          { name: "Color", value: "Black" },
          { name: "Size", value: "48" },
        ],
      });

      expect(variant).toEqual({
        id: "gid://shopify/ProductVariant/456",
        title: "Black / 48",
        sku: "GEN-COAT-01-BLK-48",
        price: { amount: 490, currency: "EUR" },
        availability: "available",
        options: [
          { name: "Color", value: "Black" },
          { name: "Size", value: "48" },
        ],
      });
    });

    it("returns null if variant ID is missing", () => {
      expect(mapShopifyVariant(null)).toBeNull();
      expect(mapShopifyVariant({})).toBeNull();
    });
  });

  // ── PRODUCT MAPPING ───────────────────────────────────────────────────────

  describe("mapShopifyProduct", () => {
    it("maps complete raw Shopify product GraphQL response to GENSIS Product domain model", () => {
      const rawProduct: RawShopifyProductNode = {
        id: "gid://shopify/Product/789",
        handle: "architectural-overcoat",
        title: "Architectural Overcoat",
        description: "Heavyweight wool overcoat with structured silhouette.",
        availableForSale: true,
        priceRange: {
          minVariantPrice: { amount: "650.00", currencyCode: "USD" },
        },
        images: {
          edges: [
            {
              node: {
                id: "img-1",
                url: "https://cdn.shopify.com/overcoat-front.jpg",
                altText: "Front view",
              },
            },
          ],
        },
        variants: {
          edges: [
            {
              node: {
                id: "var-1",
                title: "Charcoal / 50",
                availableForSale: true,
                price: { amount: "650.00", currencyCode: "USD" },
                selectedOptions: [{ name: "Color", value: "Charcoal" }],
              },
            },
          ],
        },
      };

      const product = mapShopifyProduct(rawProduct);

      expect(product).toEqual({
        id: "gid://shopify/Product/789",
        slug: "architectural-overcoat",
        title: "Architectural Overcoat",
        description: "Heavyweight wool overcoat with structured silhouette.",
        availability: "available",
        price: { amount: 650, currency: "USD" },
        images: [
          {
            id: "img-1",
            url: "https://cdn.shopify.com/overcoat-front.jpg",
            alt: "Front view",
            width: undefined,
            height: undefined,
          },
        ],
        variants: [
          {
            id: "var-1",
            title: "Charcoal / 50",
            sku: undefined,
            price: { amount: 650, currency: "USD" },
            availability: "available",
            options: [{ name: "Color", value: "Charcoal" }],
          },
        ],
      });
    });

    it("returns null if product ID or handle is missing", () => {
      expect(mapShopifyProduct(null)).toBeNull();
      expect(mapShopifyProduct({ id: "123" })).toBeNull();
      expect(mapShopifyProduct({ handle: "slug" })).toBeNull();
    });
  });

  // ── COLLECTION MAPPING ────────────────────────────────────────────────────

  describe("mapShopifyCollection", () => {
    it("maps raw Shopify collection node to GENSIS Collection domain model", () => {
      const rawCollection: RawShopifyCollectionNode = {
        id: "gid://shopify/Collection/101",
        handle: "outerwear",
        title: "Outerwear Collection",
        description: "Tailored coats and jacket silhouettes.",
        image: {
          url: "https://cdn.shopify.com/outerwear-hero.jpg",
          altText: "Outerwear hero",
        },
      };

      const collection = mapShopifyCollection(rawCollection);

      expect(collection).toEqual({
        id: "gid://shopify/Collection/101",
        slug: "outerwear",
        title: "Outerwear Collection",
        description: "Tailored coats and jacket silhouettes.",
        image: "https://cdn.shopify.com/outerwear-hero.jpg",
      });
    });

    it("returns null if collection ID or handle is missing", () => {
      expect(mapShopifyCollection(null)).toBeNull();
      expect(mapShopifyCollection({ id: "101" })).toBeNull();
    });
  });
});
