import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateCheckoutUrl } from "@/features/checkout/checkout";
import { addToBagAction, updateQuantityAction } from "@/features/cart/actions";
import { commerce } from "@/lib/commerce";
import { mapShopifyProduct } from "@/lib/commerce/providers/shopify/mapper";
import { cookies } from "next/headers";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/commerce", () => ({
  commerce: {
    addCartLines: vi.fn(),
    createCart: vi.fn(),
    updateCartLines: vi.fn(),
    removeCartLines: vi.fn(),
    getCart: vi.fn(),
    searchProducts: vi.fn(),
  },
  isCommerceConfigured: () => true,
}));

describe("Stage 4.13 Commerce Hardening Tests", () => {
  const mockCookieStore = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>);
  });

  describe("1. Cart & Purchasing Hardening", () => {
    it("rejects non-integer, negative, or >99 quantities in addToBagAction", async () => {
      const res1 = await addToBagAction({ variantId: "v-1", quantity: 0 });
      expect(res1.ok).toBe(false);
      if (!res1.ok) expect(res1.error.code).toBe("VALIDATION_ERROR");

      const res2 = await addToBagAction({ variantId: "v-1", quantity: 100 });
      expect(res2.ok).toBe(false);

      const res3 = await addToBagAction({ variantId: "v-1", quantity: 2.5 });
      expect(res3.ok).toBe(false);
    });

    it("transparently recovers when existing cart ID is expired/stale on Shopify", async () => {
      mockCookieStore.get.mockReturnValue({ value: "stale-cart-123" });
      vi.mocked(commerce.addCartLines).mockResolvedValue({
        ok: false,
        error: { code: "NOT_FOUND", message: "Cart not found or expired." },
      });
      vi.mocked(commerce.createCart).mockResolvedValue({
        ok: true,
        data: {
          id: "fresh-cart-456",
          checkoutUrl: "https://gensis.myshopify.com/cart",
          lines: [],
          cost: { totalAmount: { amount: 0, currency: "USD" } },
        },
      });

      const res = await addToBagAction({ variantId: "v-1", quantity: 1 });

      expect(res.ok).toBe(true);
      expect(mockCookieStore.delete).toHaveBeenCalledWith("gensis_cart_id");
      expect(commerce.createCart).toHaveBeenCalledWith([{ variantId: "v-1", quantity: 1 }]);
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "gensis_cart_id",
        "fresh-cart-456",
        expect.objectContaining({ httpOnly: true })
      );
    });

    it("deletes stale cart cookie when updateQuantityAction encounters NOT_FOUND", async () => {
      mockCookieStore.get.mockReturnValue({ value: "stale-cart-123" });
      vi.mocked(commerce.updateCartLines).mockResolvedValue({
        ok: false,
        error: { code: "NOT_FOUND", message: "Cart not found or expired." },
      });

      const res = await updateQuantityAction({ lineId: "line-1", quantity: 2 });
      expect(res.ok).toBe(false);
      expect(mockCookieStore.delete).toHaveBeenCalledWith("gensis_cart_id");
    });
  });

  describe("2. Checkout Handoff Security Hardening", () => {
    it("rejects userinfo attacks embedded in checkout URL", () => {
      expect(
        validateCheckoutUrl(
          "https://attacker:secret@gensis.myshopify.com/checkouts/cn/abc",
          "gensis.myshopify.com"
        )
      ).toBe(false);
    });

    it("rejects non-HTTPS checkout URLs", () => {
      expect(
        validateCheckoutUrl("http://gensis.myshopify.com/checkouts/cn/abc", "gensis.myshopify.com")
      ).toBe(false);
    });

    it("rejects protocol-relative checkout URLs", () => {
      expect(
        validateCheckoutUrl("//gensis.myshopify.com/checkouts/cn/abc", "gensis.myshopify.com")
      ).toBe(false);
    });
  });

  describe("3. Product & Media Robustness", () => {
    it("handles products with no images gracefully with empty array", () => {
      const rawProduct = {
        id: "gid://shopify/Product/1",
        handle: "minimal-jacket",
        title: "Minimal Jacket",
        availableForSale: true,
        priceRange: { minVariantPrice: { amount: "200.00", currencyCode: "USD" } },
        images: { edges: [] },
        options: [],
        variants: { edges: [] },
      };

      const product = mapShopifyProduct(rawProduct);
      expect(product).not.toBeNull();
      if (product) {
        expect(product.images).toEqual([]);
        expect(product.title).toBe("Minimal Jacket");
      }
    });

    it("maps sold-out and unavailable variants accurately", () => {
      const rawProduct = {
        id: "gid://shopify/Product/2",
        handle: "coat",
        title: "Wool Coat",
        availableForSale: true,
        priceRange: { minVariantPrice: { amount: "500.00", currencyCode: "USD" } },
        images: { edges: [] },
        options: [{ id: "opt-1", name: "Size", values: ["S", "M"] }],
        variants: {
          edges: [
            {
              node: {
                id: "v-s",
                title: "S",
                availableForSale: false,
                quantityAvailable: 0,
                price: { amount: "500.00", currencyCode: "USD" },
                selectedOptions: [{ name: "Size", value: "S" }],
              },
            },
            {
              node: {
                id: "v-m",
                title: "M",
                availableForSale: true,
                quantityAvailable: 5,
                price: { amount: "500.00", currencyCode: "USD" },
                selectedOptions: [{ name: "Size", value: "M" }],
              },
            },
          ],
        },
      };

      const product = mapShopifyProduct(rawProduct);
      expect(product?.variants[0].availability).toBe("sold-out");
      expect(product?.variants[1].availability).toBe("available");
    });
  });
});
