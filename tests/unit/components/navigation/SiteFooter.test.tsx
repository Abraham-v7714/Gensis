/**
 * SiteFooter — Stage 4.14/4.15 tests
 *
 * Verifies:
 * - All navigation groups render with their headings
 * - Links are valid anchor elements
 * - Footer has correct ARIA role
 * - Copyright text is present
 * - Each nav group has accessible aria-label
 */

import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SiteFooter } from "@/components/navigation/SiteFooter";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("SiteFooter", () => {
  it("renders with role='contentinfo'", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders the GENSIS brand link", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("link", { name: /gensis home/i })).toBeInTheDocument();
  });

  it("renders all four navigation groups", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("navigation", { name: /shop footer navigation/i })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /discover footer navigation/i })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /account footer navigation/i })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /information footer navigation/i })).toBeInTheDocument();
  });

  it("renders Shop navigation links", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("link", { name: /all products/i })).toHaveAttribute("href", "/shop");
    expect(screen.getByRole("link", { name: /collections/i })).toHaveAttribute("href", "/collections");
  });

  it("renders Discover navigation links", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("link", { name: /^journal$/i })).toHaveAttribute("href", "/journal");
    expect(screen.getByRole("link", { name: /^lookbook$/i })).toHaveAttribute("href", "/lookbook");
    expect(screen.getByRole("link", { name: /^about$/i })).toHaveAttribute("href", "/about");
  });

  it("renders Account navigation links", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("link", { name: /my account/i })).toHaveAttribute("href", "/account");
    expect(screen.getByRole("link", { name: /^bag$/i })).toHaveAttribute("href", "/bag");
  });

  it("renders copyright text with current year", () => {
    render(<SiteFooter />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument();
  });

  it("renders brand tagline in footer bottom bar", () => {
    render(<SiteFooter />);
    expect(screen.getByText(/a new generation of fashion/i)).toBeInTheDocument();
  });
});
