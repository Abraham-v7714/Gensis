import * as React from "react";
import { render, screen } from "@testing-library/react";
import { BagView } from "@/features/cart/components/BagView";
import type { Cart } from "@/types/cart";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const mockCart: Cart = {
  id: "cart-1",
  checkoutUrl: "https://checkout.shopify.com/123",
  totalQuantity: 2,
  cost: {
    totalAmount: { amount: 900, currency: "USD" },
    subtotalAmount: { amount: 900, currency: "USD" },
  },
  lines: [
    {
      id: "line-1",
      productTitle: "Architectural Coat",
      productSlug: "architectural-coat",
      quantity: 2,
      cost: { totalAmount: { amount: 900, currency: "USD" } },
      variant: {
        id: "v1",
        title: "Medium / Black",
        price: { amount: 450, currency: "USD" },
        availability: "available",
        options: [
          { name: "Size", value: "M" },
          { name: "Color", value: "Black" },
        ],
      },
    },
  ],
};

describe("BagView", () => {
  it("renders empty Bag state when cart is null", () => {
    render(<BagView cart={null} />);
    expect(screen.getByRole("heading", { name: /your bag is empty/i })).toBeInTheDocument();
    // Stage 4.15: CTA now says "Explore Shop"
    expect(screen.getByRole("link", { name: /explore shop/i })).toBeInTheDocument();
  });

  it("renders populated Bag line items, subtotal, and checkout button", () => {
    render(<BagView cart={mockCart} />);

    expect(screen.getByText("Architectural Coat")).toBeInTheDocument();
    expect(screen.getByText(/Size: M \/ Color: Black/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /proceed to checkout/i })).toBeInTheDocument();
    // Stage 4.15: Continue shopping link is present
    expect(screen.getByRole("link", { name: /continue shopping/i })).toBeInTheDocument();
  });

  it("renders unavailable state when error code is UNAVAILABLE", () => {
    render(
      <BagView
        cart={null}
        error={{
          code: "UNAVAILABLE",
          message: "Storefront credentials are not configured.",
        }}
      />
    );

    expect(screen.getByText("Commerce Unavailable")).toBeInTheDocument();
  });
});
