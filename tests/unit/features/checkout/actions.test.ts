import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkoutAction } from "@/features/checkout/actions";
import { cookies } from "next/headers";
import { commerce } from "@/lib/commerce";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/commerce", () => ({
  commerce: {
    getCart: vi.fn(),
  },
}));

vi.mock("@/lib/commerce/providers/shopify/config", () => ({
  getShopifyStoreDomain: () => "gensis.myshopify.com",
}));

type CookieStoreMock = Awaited<ReturnType<typeof cookies>>;

describe("checkoutAction", () => {
  const mockGetCart = vi.mocked(commerce.getCart);
  const mockCookies = vi.mocked(cookies);

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns NOT_FOUND error when cart cookie is missing", async () => {
    mockCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    } as unknown as CookieStoreMock);

    const result = await checkoutAction();

    expect(result).toEqual({
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "No active Bag session found.",
      },
    });
    expect(mockGetCart).not.toHaveBeenCalled();
  });

  it("returns VALIDATION_ERROR when cart has zero lines", async () => {
    mockCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "cart-123" }),
    } as unknown as CookieStoreMock);
    mockGetCart.mockResolvedValue({
      ok: true,
      data: {
        id: "cart-123",
        checkoutUrl: "https://gensis.myshopify.com/checkout/123",
        totalQuantity: 0,
        cost: { totalAmount: { amount: 0, currency: "USD" } },
        lines: [],
      },
    });

    const result = await checkoutAction();

    expect(result).toEqual({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Your Bag is empty.",
      },
    });
  });

  it("returns error from commerce.getCart when commerce provider fails", async () => {
    mockCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "cart-123" }),
    } as unknown as CookieStoreMock);
    mockGetCart.mockResolvedValue({
      ok: false,
      error: {
        code: "PROVIDER_ERROR",
        message: "Shopify connection failed",
      },
    });

    const result = await checkoutAction();

    expect(result).toEqual({
      ok: false,
      error: {
        code: "PROVIDER_ERROR",
        message: "Shopify connection failed",
      },
    });
  });

  it("returns PROVIDER_ERROR when checkoutUrl is invalid or deceptive", async () => {
    mockCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "cart-123" }),
    } as unknown as CookieStoreMock);
    mockGetCart.mockResolvedValue({
      ok: true,
      data: {
        id: "cart-123",
        checkoutUrl: "https://attacker.com/fake-checkout",
        totalQuantity: 1,
        cost: { totalAmount: { amount: 100, currency: "USD" } },
        lines: [{ id: "l1", quantity: 1, productTitle: "Item", productSlug: "item" }],
      },
    });

    const result = await checkoutAction();

    expect(result).toEqual({
      ok: false,
      error: {
        code: "PROVIDER_ERROR",
        message: "Checkout destination is invalid.",
      },
    });
  });

  it("returns ok: true with validated URL when cart and URL are valid", async () => {
    mockCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "cart-123" }),
    } as unknown as CookieStoreMock);
    mockGetCart.mockResolvedValue({
      ok: true,
      data: {
        id: "cart-123",
        checkoutUrl: "https://gensis.myshopify.com/checkout/123",
        totalQuantity: 1,
        cost: { totalAmount: { amount: 100, currency: "USD" } },
        lines: [{ id: "l1", quantity: 1, productTitle: "Item", productSlug: "item" }],
      },
    });

    const result = await checkoutAction();

    expect(result).toEqual({
      ok: true,
      data: "https://gensis.myshopify.com/checkout/123",
    });
  });
});
