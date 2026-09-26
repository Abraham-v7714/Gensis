import { describe, it, expect, vi, beforeEach } from "vitest";
import { addToBagAction, updateQuantityAction, removeItemAction } from "@/features/cart/actions";

// Mock next/headers cookies
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

// Mock commerce client
vi.mock("@/lib/commerce", () => ({
  commerce: {
    addCartLines: vi.fn(),
    createCart: vi.fn(),
    updateCartLines: vi.fn(),
    removeCartLines: vi.fn(),
    getCart: vi.fn(),
  },
  isCommerceConfigured: vi.fn().mockReturnValue(true),
}));

describe("Cart Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid quantity (quantity = 0 or 100 or non-integer) on addToBagAction", async () => {
    const resZero = await addToBagAction({ variantId: "v1", quantity: 0 });
    expect(resZero.ok).toBe(false);
    if (!resZero.ok) {
      expect(resZero.error.code).toBe("VALIDATION_ERROR");
      expect(resZero.error.message).toContain("Quantity must be a whole number between 1 and 99");
    }

    const resTooLarge = await addToBagAction({ variantId: "v1", quantity: 500 });
    expect(resTooLarge.ok).toBe(false);
    if (!resTooLarge.ok) {
      expect(resTooLarge.error.code).toBe("VALIDATION_ERROR");
    }

    const resFloat = await addToBagAction({ variantId: "v1", quantity: 1.5 });
    expect(resFloat.ok).toBe(false);
    if (!resFloat.ok) {
      expect(resFloat.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("rejects missing variantId on addToBagAction", async () => {
    const res = await addToBagAction({ variantId: "", quantity: 1 });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("validates updateQuantityAction inputs", async () => {
    const resInvalid = await updateQuantityAction({ lineId: "line-1", quantity: -5 });
    expect(resInvalid.ok).toBe(false);
    if (!resInvalid.ok) {
      expect(resInvalid.error.code).toBe("VALIDATION_ERROR");
    }

    const resMissingId = await updateQuantityAction({ lineId: "", quantity: 2 });
    expect(resMissingId.ok).toBe(false);
    if (!resMissingId.ok) {
      expect(resMissingId.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("validates removeItemAction inputs", async () => {
    const resMissingId = await removeItemAction({ lineId: "" });
    expect(resMissingId.ok).toBe(false);
    if (!resMissingId.ok) {
      expect(resMissingId.error.code).toBe("VALIDATION_ERROR");
    }
  });
});
