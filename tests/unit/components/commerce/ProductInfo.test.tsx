import * as React from "react";
import { render, screen } from "@testing-library/react";
import { ProductInfo } from "@/components/commerce/ProductInfo";
import type { Product } from "@/types/product";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const mockProduct: Product = {
  id: "prod-1",
  slug: "architectural-jacket",
  title: "Architectural Jacket",
  description: "Crafted from heavy wool felt.",
  price: { amount: 450, currency: "USD" },
  availability: "available",
  images: [],
  variants: [
    {
      id: "v1",
      sku: "ARCH-JKT-S",
      title: "Small",
      price: { amount: 450, currency: "USD" },
      availability: "available",
      options: [{ name: "Size", value: "S" }],
    },
    {
      id: "v2",
      sku: "ARCH-JKT-M",
      title: "Medium",
      price: { amount: 450, currency: "USD" },
      availability: "available",
      options: [{ name: "Size", value: "M" }],
    },
  ],
};

describe("ProductInfo", () => {
  it("renders product title, price, description, and initial variant SKU", () => {
    render(<ProductInfo product={mockProduct} />);

    expect(screen.getByRole("heading", { name: "Architectural Jacket", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("$450")).toBeInTheDocument();
    expect(screen.getByText(/Crafted from heavy wool felt/i)).toBeInTheDocument();
    expect(screen.getByText(/SKU: ARCH-JKT-S/i)).toBeInTheDocument();
  });

  it("shows sold-out badge and disabled CTA when product is sold out", () => {
    const soldOutMock: Product = {
      ...mockProduct,
      availability: "sold-out",
      variants: [
        {
          ...mockProduct.variants[0],
          availability: "sold-out",
        },
      ],
    };
    render(<ProductInfo product={soldOutMock} />);
    expect(screen.getByLabelText("Sold out")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sold Out" })).toBeDisabled();
  });

  it("re-uses existing VariantSelector for variant changes", () => {
    render(<ProductInfo product={mockProduct} />);
    expect(screen.getByRole("radio", { name: /S/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /M/i })).toBeInTheDocument();
  });
});
