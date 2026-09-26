import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from '@/components/ui/Tabs';
import type { Tab } from '@/components/ui/Tabs';

const tabs: Tab[] = [
  { id: 'details', label: 'Details', content: 'Details content' },
  { id: 'shipping', label: 'Shipping', content: 'Shipping content' },
  { id: 'returns', label: 'Returns', content: 'Returns content' },
];

describe('Tabs', () => {
  it('renders a tablist', () => {
    render(<Tabs tabs={tabs} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('renders tabs with correct roles', () => {
    render(<Tabs tabs={tabs} />);
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('first tab is active by default', () => {
    render(<Tabs tabs={tabs} />);
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Shipping' })).toHaveAttribute('aria-selected', 'false');
  });

  it('defaultTabId sets initial active tab', () => {
    render(<Tabs tabs={tabs} defaultTabId="shipping" />);
    expect(screen.getByRole('tab', { name: 'Shipping' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'false');
  });

  it('invalid defaultTabId falls back to first tab', () => {
    render(<Tabs tabs={tabs} defaultTabId="bogus" />);
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true');
  });

  it('clicking a tab makes it active and shows its panel', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={tabs} />);
    await user.click(screen.getByRole('tab', { name: 'Shipping' }));
    expect(screen.getByRole('tab', { name: 'Shipping' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Shipping content')).toBeInTheDocument();
  });

  it('ArrowRight moves to next tab', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={tabs} />);
    screen.getByRole('tab', { name: 'Details' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Shipping' })).toHaveAttribute('aria-selected', 'true');
  });

  it('ArrowLeft moves to previous tab', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={tabs} defaultTabId="shipping" />);
    screen.getByRole('tab', { name: 'Shipping' }).focus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true');
  });

  it('Home selects first tab', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={tabs} defaultTabId="returns" />);
    screen.getByRole('tab', { name: 'Returns' }).focus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true');
  });

  it('End selects last tab', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={tabs} />);
    screen.getByRole('tab', { name: 'Details' }).focus();
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Returns' })).toHaveAttribute('aria-selected', 'true');
  });

  it('renders nothing when tabs is empty', () => {
    const { container } = render(<Tabs tabs={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('tabpanel is associated with correct tab via aria-labelledby', () => {
    render(<Tabs tabs={tabs} />);
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('aria-labelledby', 'tab-details');
  });
});
