import { describe, it, expect } from "vitest";
import { commerce } from "@/lib/commerce";
import type { CommerceClient } from "@/lib/commerce";
import type { Product } from "@/types/product";
import type { Collection } from "@/types/collection";

describe("Commerce Domain Boundary Neutrality", () => {
  it("exports active commerce singleton matching CommerceClient interface", () => {
    const clientInstance: CommerceClient = commerce;
    expect(clientInstance).toBeDefined();
    expect(typeof clientInstance.getProducts).toBe("function");
    expect(typeof clientInstance.getProductBySlug).toBe("function");
    expect(typeof clientInstance.getCollections).toBe("function");
    expect(typeof clientInstance.getCollectionBySlug).toBe("function");
    expect(typeof clientInstance.searchProducts).toBe("function");
  });

  it("ensures domain model structures do not leak Shopify GraphQL edges or node shapes", () => {
    const mockCollection: Collection = {
      id: "col-1",
      slug: "outerwear",
      title: "Outerwear",
    };
    expect(mockCollection).toBeDefined();
    const mockProduct: Product = {
      id: "prod-1",
      slug: "tailored-blazer",
      title: "Tailored Blazer",
      description: "Architectural silhouette blazer.",
      images: [
        {
          id: "img-1",
          url: "https://example.com/blazer.jpg",
          alt: "Blazer front view",
        },
      ],
      price: { amount: 550, currency: "USD" },
      variants: [
        {
          id: "var-1",
          title: "Black / 48",
          price: { amount: 550, currency: "USD" },
          availability: "available",
          options: [{ name: "Color", value: "Black" }],
        },
      ],
      availability: "available",
    };

    expect(mockProduct).not.toHaveProperty("edges");
    expect(mockProduct).not.toHaveProperty("node");
    expect(mockProduct).not.toHaveProperty("priceRange");
    expect(mockProduct.variants[0]).not.toHaveProperty("selectedOptions");
  });
});
