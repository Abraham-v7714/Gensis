import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VariantSelector } from '@/components/commerce/VariantSelector';
import type { ProductVariant } from '@/types/product';
import { vi } from 'vitest';

const mockVariants: ProductVariant[] = [
  {
    id: 'v1',
    sku: 'S-BLK',
    title: 'Small Black',
    price: { amount: 100, currency: 'USD' },
    availability: 'in-stock',
    options: [
      { name: 'Size', value: 'S' },
      { name: 'Color', value: 'Black' }
    ]
  },
  {
    id: 'v2',
    sku: 'M-BLK',
    title: 'Medium Black',
    price: { amount: 100, currency: 'USD' },
    availability: 'sold-out',
    options: [
      { name: 'Size', value: 'M' },
      { name: 'Color', value: 'Black' }
    ]
  },
  {
    id: 'v3',
    sku: 'S-WHT',
    title: 'Small White',
    price: { amount: 100, currency: 'USD' },
    availability: 'unavailable',
    options: [
      { name: 'Size', value: 'S' },
      { name: 'Color', value: 'White' }
    ]
  }
];

describe('VariantSelector', () => {
  it('renders option groups and values', () => {
    render(<VariantSelector variants={mockVariants} onVariantChange={vi.fn()} />);
    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByText('Color')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /S/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /M/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Black/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /White/ })).toBeInTheDocument();
  });

  it('indicates sold-out and unavailable variants', () => {
    render(<VariantSelector variants={mockVariants} selectedVariantId="v1" onVariantChange={vi.fn()} />);
    const mediumRadio = screen.getByRole('radio', { name: /M/i });
    expect(mediumRadio).toBeDisabled();
    
    const whiteRadio = screen.getByRole('radio', { name: /White/i });
    expect(whiteRadio).toBeDisabled();
  });

  it('calls onVariantChange with correct variant', async () => {
    const user = userEvent.setup();
    const handleVariantChange = vi.fn();
    // Default selection is nothing until we click. Or we can provide a selectedVariantId
    render(<VariantSelector variants={mockVariants} onVariantChange={handleVariantChange} />);
    
    // Select S
    await user.click(screen.getByRole('radio', { name: /S/ }));
    // Select Black
    await user.click(screen.getByRole('radio', { name: /Black/ }));
    
    expect(handleVariantChange).toHaveBeenCalledWith(mockVariants[0]);
  });

  it('gracefully handles empty variants', () => {
    render(<VariantSelector variants={[]} onVariantChange={vi.fn()} />);
    expect(screen.getByText(/no options available/i)).toBeInTheDocument();
  });

  it('exposes selected state correctly', () => {
    render(<VariantSelector variants={mockVariants} selectedVariantId="v1" onVariantChange={vi.fn()} />);
    expect(screen.getByRole('radio', { name: /S/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Black/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /M/ })).not.toBeChecked();
  });
});
