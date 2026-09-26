import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { EditorialText } from '@/components/editorial/EditorialText';
import { PullQuote } from '@/components/editorial/PullQuote';

// ---------------------------------------------------------------------------
// EditorialText
// ---------------------------------------------------------------------------
describe('EditorialText', () => {
  it('renders the heading', () => {
    render(<EditorialText title="Campaign Story" />);
    expect(screen.getByRole('heading', { name: 'Campaign Story' })).toBeInTheDocument();
  });

  it('renders eyebrow when provided', () => {
    render(<EditorialText title="Story" eyebrow="Spring 2026" />);
    expect(screen.getByText('Spring 2026')).toBeInTheDocument();
  });

  it('does not render eyebrow when omitted', () => {
    render(<EditorialText title="Story" />);
    expect(screen.queryByText(/spring/i)).not.toBeInTheDocument();
  });

  it('renders body when provided', () => {
    render(<EditorialText title="Story" body="Body copy goes here." />);
    expect(screen.getByText('Body copy goes here.')).toBeInTheDocument();
  });

  it('does not render body when omitted', () => {
    render(<EditorialText title="Story" />);
    expect(screen.queryByText(/body copy/i)).not.toBeInTheDocument();
  });

  it('uses the requested heading level', () => {
    render(<EditorialText title="Story" titleAs="h1" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Story' })).toBeInTheDocument();
  });

  it('does not crash with alignment prop', () => {
    render(<EditorialText title="Center Story" align="center" />);
    expect(screen.getByRole('heading', { name: 'Center Story' })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// PullQuote
// ---------------------------------------------------------------------------
describe('PullQuote', () => {
  it('renders a figure element', () => {
    render(<PullQuote quote="Fashion is art." />);
    expect(screen.getByRole('figure')).toBeInTheDocument();
  });

  it('renders the quote inside a blockquote', () => {
    render(<PullQuote quote="Fashion is art." />);
    const blockquote = document.querySelector('blockquote');
    expect(blockquote).toBeInTheDocument();
    expect(blockquote?.textContent).toContain('Fashion is art.');
  });

  it('renders attribution when provided', () => {
    render(<PullQuote quote="Fashion is art." attribution="GENSIS Founder" />);
    expect(screen.getByText(/GENSIS Founder/i)).toBeInTheDocument();
  });

  it('does not render figcaption when attribution is omitted', () => {
    render(<PullQuote quote="Fashion is art." />);
    expect(document.querySelector('figcaption')).not.toBeInTheDocument();
  });
});
