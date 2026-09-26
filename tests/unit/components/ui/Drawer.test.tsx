import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Drawer } from '@/components/ui/Drawer';
import { vi } from 'vitest';

describe('Drawer', () => {
  it('is not in the document when closed', () => {
    render(<Drawer open={false} onClose={vi.fn()} title="Bag"><p>Content</p></Drawer>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows drawer with accessible title when open', () => {
    render(<Drawer open={true} onClose={vi.fn()} title="Bag"><p>Bag content</p></Drawer>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Bag')).toBeInTheDocument();
  });

  it('provides accessible name via title', () => {
    render(<Drawer open={true} onClose={vi.fn()} title="Shopping Bag"><p>Content</p></Drawer>);
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Shopping Bag');
  });

  it('close button calls onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Drawer open={true} onClose={onClose} title="Bag"><p>Content</p></Drawer>);
    await user.click(screen.getByRole('button', { name: /close bag/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders children when open', () => {
    render(<Drawer open={true} onClose={vi.fn()} title="Test"><p>Drawer body</p></Drawer>);
    expect(screen.getByText('Drawer body')).toBeInTheDocument();
  });

  it('handles repeated open/close cycles', () => {
    const { rerender } = render(<Drawer open={false} onClose={vi.fn()} title="Test"><p>Content</p></Drawer>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(<Drawer open={true} onClose={vi.fn()} title="Test"><p>Content</p></Drawer>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    rerender(<Drawer open={false} onClose={vi.fn()} title="Test"><p>Content</p></Drawer>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
