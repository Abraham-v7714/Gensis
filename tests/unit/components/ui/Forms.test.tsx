import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Radio } from '@/components/ui/Radio';
import { Field } from '@/components/ui/Field';
import { FormMessage } from '@/components/ui/FormMessage';

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
describe('Input', () => {
  it('renders a textbox', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('is associated with a label via id', () => {
    render(
      <>
        <label htmlFor="email">Email</label>
        <Input id="email" />
      </>
    );
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('disabled state works', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('required state works', () => {
    render(<Input required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('forwards aria-invalid', () => {
    render(<Input aria-invalid="true" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('forwards aria-describedby', () => {
    render(<Input aria-describedby="hint" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'hint');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Textarea
// ---------------------------------------------------------------------------
describe('Textarea', () => {
  it('renders a textarea', () => {
    render(<Textarea />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('disabled state works', () => {
    render(<Textarea disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('required state works', () => {
    render(<Textarea required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('forwards aria-invalid', () => {
    render(<Textarea aria-invalid="true" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });
});

// ---------------------------------------------------------------------------
// Select
// ---------------------------------------------------------------------------
describe('Select', () => {
  it('renders a combobox', () => {
    render(
      <Select>
        <option value="a">Option A</option>
      </Select>
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('disabled state works', () => {
    render(<Select disabled><option>A</option></Select>);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('required state works', () => {
    render(<Select required><option>A</option></Select>);
    expect(screen.getByRole('combobox')).toBeRequired();
  });
});

// ---------------------------------------------------------------------------
// Checkbox
// ---------------------------------------------------------------------------
describe('Checkbox', () => {
  it('renders a checkbox', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('disabled state works', () => {
    render(<Checkbox disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('defaultChecked works', () => {
    render(<Checkbox defaultChecked />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('is associated with a label', () => {
    render(
      <>
        <label htmlFor="agree">I agree</label>
        <Checkbox id="agree" />
      </>
    );
    expect(screen.getByLabelText('I agree')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Radio
// ---------------------------------------------------------------------------
describe('Radio', () => {
  it('renders a radio button', () => {
    render(<Radio />);
    expect(screen.getByRole('radio')).toBeInTheDocument();
  });

  it('disabled state works', () => {
    render(<Radio disabled />);
    expect(screen.getByRole('radio')).toBeDisabled();
  });

  it('defaultChecked works', () => {
    render(<Radio defaultChecked />);
    expect(screen.getByRole('radio')).toBeChecked();
  });

  it('name groups radios together', () => {
    render(
      <>
        <Radio name="size" value="s" />
        <Radio name="size" value="m" />
      </>
    );
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    radios.forEach((r) => expect(r).toHaveAttribute('name', 'size'));
  });
});

// ---------------------------------------------------------------------------
// Field
// ---------------------------------------------------------------------------
describe('Field', () => {
  it('renders label associated with control', () => {
    render(
      <Field label="Email" htmlFor="email-field">
        <Input id="email-field" />
      </Field>
    );
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders description only when provided', () => {
    const { rerender } = render(
      <Field label="Name" htmlFor="name"><Input id="name" /></Field>
    );
    expect(screen.queryByText(/Enter your name/i)).not.toBeInTheDocument();

    rerender(
      <Field label="Name" htmlFor="name" description="Enter your full name"><Input id="name" /></Field>
    );
    expect(screen.getByText('Enter your full name')).toBeInTheDocument();
  });

  it('renders message only when provided', () => {
    const { rerender } = render(
      <Field label="Name" htmlFor="name"><Input id="name" /></Field>
    );
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();

    rerender(
      <Field label="Name" htmlFor="name" message="Name is required" messageType="error">
        <Input id="name" />
      </Field>
    );
    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('required indicator is present when required', () => {
    render(
      <Field label="Email" htmlFor="email" required><Input id="email" /></Field>
    );
    expect(screen.getByText('(required)')).toBeInTheDocument();
  });

  it('error message uses role=alert', () => {
    render(
      <Field label="Email" htmlFor="email" message="Invalid email" messageType="error">
        <Input id="email" />
      </Field>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// FormMessage
// ---------------------------------------------------------------------------
describe('FormMessage', () => {
  it('renders message text', () => {
    render(<FormMessage>Something went wrong</FormMessage>);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('error type uses role=alert', () => {
    render(<FormMessage type="error">Error occurred</FormMessage>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('success type does not use role=alert', () => {
    render(<FormMessage type="success">Saved!</FormMessage>);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('info type does not use role=alert', () => {
    render(<FormMessage type="info">Information</FormMessage>);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('id is preserved', () => {
    render(<FormMessage id="msg-1">Message</FormMessage>);
    expect(document.getElementById('msg-1')).toBeInTheDocument();
  });
});
