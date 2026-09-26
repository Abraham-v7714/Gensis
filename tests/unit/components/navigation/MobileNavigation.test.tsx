import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileNavigation } from '@/components/navigation/MobileNavigation';

describe('MobileNavigation', () => {
  it('renders accessible menu trigger button', () => {
    render(<MobileNavigation />);
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
  });

  it('menu is not shown initially', () => {
    render(<MobileNavigation />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('clicking trigger opens the menu', async () => {
    const user = userEvent.setup();
    render(<MobileNavigation />);
    await user.click(screen.getByRole('button', { name: /open menu/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('trigger updates aria-expanded when menu is open', async () => {
    const user = userEvent.setup();
    render(<MobileNavigation />);
    const trigger = screen.getByRole('button', { name: /open menu/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(screen.getByRole('button', { name: /close menu/i })).toHaveAttribute('aria-expanded', 'true');
  });

  it('trigger aria-controls points to the menu element', async () => {
    const user = userEvent.setup();
    render(<MobileNavigation />);
    await user.click(screen.getByRole('button', { name: /open menu/i }));
    expect(screen.getByRole('button', { name: /close menu/i })).toHaveAttribute('aria-controls', 'mobile-menu');
    expect(document.getElementById('mobile-menu')).toBeInTheDocument();
  });

  it('navigation links are visible when menu is open', async () => {
    const user = userEvent.setup();
    render(<MobileNavigation />);
    await user.click(screen.getByRole('button', { name: /open menu/i }));
    // At least one nav link should be present
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  });

  it('Escape key closes the menu', async () => {
    const user = userEvent.setup();
    render(<MobileNavigation />);
    await user.click(screen.getByRole('button', { name: /open menu/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('main content becomes inert while menu is open', async () => {
    const user = userEvent.setup();
    // Set up a main content element as the isolation target
    const main = document.createElement('main');
    main.id = 'main-content';
    document.body.appendChild(main);

    render(<MobileNavigation />);
    await user.click(screen.getByRole('button', { name: /open menu/i }));
    expect(main.hasAttribute('inert')).toBe(true);

    // Close and verify restored
    await user.click(screen.getByRole('button', { name: /close menu/i }));
    expect(main.hasAttribute('inert')).toBe(false);

    document.body.removeChild(main);
  });

  it('handles repeated open/close cycles', async () => {
    const user = userEvent.setup();
    render(<MobileNavigation />);
    await user.click(screen.getByRole('button', { name: /open menu/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /close menu/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /open menu/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
