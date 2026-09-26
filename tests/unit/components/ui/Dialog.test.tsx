import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from '@/components/ui/Dialog';
import { vi } from 'vitest';

describe('Dialog', () => {
  it('does not expose dialog content when closed', () => {
    render(<Dialog open={false} onClose={vi.fn()} title="Settings"><p>Content</p></Dialog>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows dialog and accessible title when open', () => {
    render(<Dialog open={true} onClose={vi.fn()} title="Settings"><p>Content</p></Dialog>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('provides accessible name via title', () => {
    render(<Dialog open={true} onClose={vi.fn()} title="My Dialog"><p>Content</p></Dialog>);
    expect(screen.getByRole('dialog')).toHaveAccessibleName('My Dialog');
  });

  it('close button calls onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Dialog open={true} onClose={onClose} title="Test"><p>Content</p></Dialog>);
    await user.click(screen.getByRole('button', { name: /close test/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders children when open', () => {
    render(<Dialog open={true} onClose={vi.fn()} title="Test"><p>Dialog body</p></Dialog>);
    expect(screen.getByText('Dialog body')).toBeInTheDocument();
  });

  it('handles repeated open/close cycles', () => {
    const { rerender } = render(<Dialog open={false} onClose={vi.fn()} title="Test"><p>Content</p></Dialog>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(<Dialog open={true} onClose={vi.fn()} title="Test"><p>Content</p></Dialog>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    rerender(<Dialog open={false} onClose={vi.fn()} title="Test"><p>Content</p></Dialog>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
