import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { Price } from '@/components/commerce/Price';

describe('Price', () => {
  it('formats USD currency correctly', () => {
    render(<Price money={{ amount: 100, currency: 'USD' }} />);
    expect(screen.getByText(/\$100/i)).toBeInTheDocument();
  });

  it('formats INR currency correctly', () => {
    render(<Price money={{ amount: 1500.5, currency: 'INR' }} />);
    expect(screen.getByText(/₹1,500\.50/i)).toBeInTheDocument();
  });

  it('renders gracefully without decimal fractions when applicable', () => {
    render(<Price money={{ amount: 100, currency: 'USD' }} />);
    expect(screen.getByText(/\$100/i)).toBeInTheDocument();
  });
});
