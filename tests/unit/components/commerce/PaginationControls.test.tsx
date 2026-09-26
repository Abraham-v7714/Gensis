import * as React from "react";
import { render, screen } from "@testing-library/react";
import { PaginationControls } from "@/components/commerce/PaginationControls";
import { describe, it, expect } from "vitest";

describe("PaginationControls", () => {
  it("returns null if there is neither previous nor next page", () => {
    const { container } = render(
      <PaginationControls
        pageInfo={{ hasNextPage: false, hasPreviousPage: false }}
        baseUrl="/collections/fw26"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders active Next link with cursor query parameter when hasNextPage is true", () => {
    render(
      <PaginationControls
        pageInfo={{
          hasNextPage: true,
          hasPreviousPage: false,
          endCursor: "cursor-123",
        }}
        baseUrl="/collections/fw26"
      />
    );

    const nextLink = screen.getByRole("link", { name: /next/i });
    expect(nextLink).toBeInTheDocument();
    expect(nextLink).toHaveAttribute("href", "/collections/fw26?after=cursor-123");
    expect(screen.getByText(/← Previous/i)).toBeInTheDocument();
  });

  it("preserves searchParams in pagination links", () => {
    render(
      <PaginationControls
        pageInfo={{
          hasNextPage: true,
          hasPreviousPage: false,
          endCursor: "cursor-456",
        }}
        baseUrl="/search"
        searchParams={{ q: "jacket" }}
      />
    );

    const nextLink = screen.getByRole("link", { name: /next/i });
    expect(nextLink).toHaveAttribute("href", "/search?q=jacket&after=cursor-456");
  });
});
