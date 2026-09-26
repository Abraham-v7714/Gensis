import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion } from '@/components/ui/Accordion';
import type { AccordionItem } from '@/components/ui/Accordion';

const items: AccordionItem[] = [
  { id: 'a', title: 'Item A', content: 'Content A' },
  { id: 'b', title: 'Item B', content: 'Content B' },
  { id: 'c', title: 'Item C', content: 'Content C' },
];

describe('Accordion', () => {
  it('renders item titles as accessible buttons', () => {
    render(<Accordion items={items} />);
    expect(screen.getByRole('button', { name: 'Item A' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Item B' })).toBeInTheDocument();
  });

  it('items are collapsed by default', () => {
    render(<Accordion items={items} />);
    expect(screen.getByRole('button', { name: 'Item A' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('clicking a trigger expands its panel', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);
    await user.click(screen.getByRole('button', { name: 'Item A' }));
    expect(screen.getByRole('button', { name: 'Item A' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Content A')).toBeVisible();
  });

  it('clicking an expanded trigger collapses it', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);
    await user.click(screen.getByRole('button', { name: 'Item A' }));
    await user.click(screen.getByRole('button', { name: 'Item A' }));
    expect(screen.getByRole('button', { name: 'Item A' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('multiple=false: only one item open at a time', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} multiple={false} />);
    await user.click(screen.getByRole('button', { name: 'Item A' }));
    expect(screen.getByRole('button', { name: 'Item A' })).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('button', { name: 'Item B' }));
    expect(screen.getByRole('button', { name: 'Item A' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'Item B' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('multiple=true: allows multiple items open', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} multiple={true} />);
    await user.click(screen.getByRole('button', { name: 'Item A' }));
    await user.click(screen.getByRole('button', { name: 'Item B' }));
    expect(screen.getByRole('button', { name: 'Item A' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Item B' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('defaultOpenIds opens specified items initially', () => {
    render(<Accordion items={items} defaultOpenIds={['b']} />);
    expect(screen.getByRole('button', { name: 'Item B' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Item A' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('invalid defaultOpenIds are ignored safely', () => {
    render(<Accordion items={items} defaultOpenIds={['nonexistent']} />);
    expect(screen.getByRole('button', { name: 'Item A' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('empty items renders nothing', () => {
    const { container } = render(<Accordion items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('aria-controls references the panel id', () => {
    render(<Accordion items={[{ id: 'test', title: 'Test', content: 'Test content' }]} />);
    const button = screen.getByRole('button', { name: 'Test' });
    expect(button).toHaveAttribute('aria-controls', 'accordion-panel-test');
    expect(document.getElementById('accordion-panel-test')).toBeInTheDocument();
  });
});
