import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/commerce/ProductCard';
import type { Product } from '@/types/product';
import { describe, it, expect } from 'vitest';

const mockProduct: Product = {
  id: 'prod_1',
  slug: 'test-product',
  title: 'Test Product',
  description: 'Test description',
  price: { amount: 150, currency: 'USD' },
  availability: 'available',
  images: [
    { id: 'img-1', url: '/test.jpg', alt: 'Test image alt', width: 800, height: 1000 }
  ],
  variants: [],
  options: [],
};

const soldOutProduct: Product = {
  ...mockProduct,
  id: 'prod_2',
  slug: 'minimalist-trench',
  title: 'Minimalist Trench',
  availability: 'sold-out',
};

describe('ProductCard', () => {
  it('renders product title and price', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText(/\$150/)).toBeInTheDocument();
  });

  it('renders link pointing to correct product page', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByRole('link', { name: 'Test Product' })).toHaveAttribute('href', '/products/test-product');
  });

  it('renders image with appropriate alt text', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByAltText('Test image alt')).toBeInTheDocument();
  });

  it('remains usable without an image', () => {
    const noImageProduct = { ...mockProduct, images: [] };
    render(<ProductCard product={noImageProduct} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  // Stage 4.15: Sold-out behavior
  it('shows sold-out indicator for sold-out product', () => {
    render(<ProductCard product={soldOutProduct} />);
    // aria-label on the link includes "— Sold Out"
    expect(screen.getByRole('link', { name: /minimalist trench.*sold out/i })).toBeInTheDocument();
    // Visual label visible in the overlay (aria-hidden but text present)
    expect(screen.getByText(/sold out/i)).toBeInTheDocument();
  });

  it('does not show sold-out indicator for available product', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.queryByText(/sold out/i)).not.toBeInTheDocument();
  });
});
