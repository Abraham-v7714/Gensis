import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { ProductGrid } from '@/components/commerce/ProductGrid';
import type { Product } from '@/types/product';

const mockProducts: Product[] = [
  {
    id: 'prod_1',
    slug: 'test-product-1',
    title: 'Test Product 1',
    description: '',
    price: { amount: 150, currency: 'USD' },
    images: [],
    variants: [],
    options: []
  },
  {
    id: 'prod_2',
    slug: 'test-product-2',
    title: 'Test Product 2',
    description: '',
    price: { amount: 200, currency: 'USD' },
    images: [],
    variants: [],
    options: []
  }
];

describe('ProductGrid', () => {
  it('renders all supplied products', () => {
    render(<ProductGrid products={mockProducts} />);
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
  });

  it('renders intended empty state when products array is empty', () => {
    render(<ProductGrid products={[]} />);
    expect(screen.getByText(/no products available/i)).toBeInTheDocument();
  });
});
