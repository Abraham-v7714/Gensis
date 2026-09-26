import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductGallery } from "@/components/commerce/ProductGallery";
import type { ProductImage } from "@/types/product";
import { describe, it, expect } from "vitest";

const mockImages: ProductImage[] = [
  { id: "img1", url: "https://example.com/img1.jpg", alt: "Black Coat Front" },
  { id: "img2", url: "https://example.com/img2.jpg", alt: "Black Coat Back" },
  { id: "img3", url: "https://example.com/img3.jpg", alt: "Black Coat Detail" },
];

describe("ProductGallery", () => {
  it("renders graceful fallback when no images are provided", () => {
    render(<ProductGallery images={[]} title="Minimal Coat" />);
    expect(screen.getByText(/no image available/i)).toBeInTheDocument();
  });

  it("renders single static image presentation when 1 image is provided", () => {
    render(<ProductGallery images={[mockImages[0]]} title="Minimal Coat" />);
    expect(screen.getByAltText("Black Coat Front")).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  it("renders thumbnail strip and supports thumbnail selection for multiple images", async () => {
    const user = userEvent.setup();
    render(<ProductGallery images={mockImages} title="Minimal Coat" />);

    expect(screen.getByAltText("Black Coat Front")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);

    // Click second thumbnail
    await user.click(screen.getByRole("tab", { name: /view image 2/i }));
    expect(screen.getByAltText("Black Coat Back")).toBeInTheDocument();
  });

  it("supports keyboard navigation (ArrowRight / ArrowLeft)", async () => {
    const user = userEvent.setup();
    render(<ProductGallery images={mockImages} title="Minimal Coat" />);

    const galleryRegion = screen.getByRole("region", { name: /minimal coat image gallery/i });
    galleryRegion.focus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByAltText("Black Coat Back")).toBeInTheDocument();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByAltText("Black Coat Detail")).toBeInTheDocument();

    await user.keyboard("{ArrowLeft}");
    expect(screen.getByAltText("Black Coat Back")).toBeInTheDocument();
  });
});
