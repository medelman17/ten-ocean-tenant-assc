/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@/lib/utils/test-utils';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Create a simple form with a checkbox for testing integration with react-hook-form
const TestForm = () => {
  const schema = z.object({
    acceptTerms: z.boolean()
      .refine(val => val === true, {
        message: "You must accept the terms"
      })
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  const onSubmit = jest.fn();

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <Checkbox
          id="acceptTerms"
          checked={form.watch("acceptTerms")}
          onCheckedChange={(checked) => {
            form.setValue("acceptTerms", checked === true);
          }}
        />
        <label htmlFor="acceptTerms">Accept Terms</label>
      </div>
      {form.formState.errors.acceptTerms && (
        <p role="alert">{form.formState.errors.acceptTerms.message}</p>
      )}
      <button type="submit">Submit</button>
    </form>
  );
};

describe('Checkbox Component', () => {
  it('renders a checkbox', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('can be checked and unchecked', async () => {
    const { user } = render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');

    // Check the checkbox
    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    // Uncheck the checkbox
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('calls onCheckedChange when clicked', async () => {
    const onCheckedChange = jest.fn();
    const { user } = render(<Checkbox onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);

    await user.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it('can be disabled', async () => {
    const onCheckedChange = jest.fn();
    const { user } = render(<Checkbox disabled onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('works with react-hook-form', async () => {
    const { user } = render(<TestForm />);

    // Try to submit the form without checking the checkbox
    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('You must accept the terms');

    // Check the checkbox and submit
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /submit/i }));

    // Error message should be gone
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});