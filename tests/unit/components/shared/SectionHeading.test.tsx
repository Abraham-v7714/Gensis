import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { SectionHeading } from '@/components/shared/SectionHeading';

describe('SectionHeading', () => {
  it('renders correctly with given title', () => {
    render(<SectionHeading title="Test Title" />);
    expect(screen.getByRole('heading', { name: /test title/i })).toBeInTheDocument();
  });

  it('conditionally renders eyebrow and description', () => {
    render(
      <SectionHeading 
        title="Test Title" 
        eyebrow="Eyebrow Text"
        description="Description Text"
      />
    );
    expect(screen.getByText(/eyebrow text/i)).toBeInTheDocument();
    expect(screen.getByText(/description text/i)).toBeInTheDocument();
  });


});
