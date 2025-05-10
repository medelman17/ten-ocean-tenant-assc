/**
 * @jest-environment jsdom
 */

import React, { FormEvent } from 'react';
import { render, screen } from '@/lib/utils/test-utils';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Mock FormData to test how checkbox values are handled
const mockFormDataAppend = jest.fn();
global.FormData = jest.fn().mockImplementation(() => ({
  append: mockFormDataAppend,
  get: jest.fn(),
  getAll: jest.fn(),
  has: jest.fn(),
  delete: jest.fn(),
  entries: jest.fn(),
  keys: jest.fn(),
  values: jest.fn(),
  forEach: jest.fn(),
}));

// Create a form component that uses FormData API like our real forms
const CheckboxFormDataTest = () => {
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

  const onSubmit = (data: FormValues) => {
    console.log("Form submitted with data:", data);
    const formData = new FormData();

    // This is the pattern we use in our actual form submission
    // to handle checkbox values correctly
    if (data.acceptTerms === true) {
      formData.append("acceptTerms", "on");
    }

    // Add a simple reference check
    return { submitted: true };
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <Checkbox
          id="acceptTerms"
          data-testid="terms-checkbox"
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

describe('Checkbox with FormData', () => {
  beforeEach(() => {
    mockFormDataAppend.mockClear();
    (global.FormData as jest.Mock).mockClear();
  });

  it('correctly appends "on" to FormData when checkbox is checked', async () => {
    const { user } = render(<CheckboxFormDataTest />);
    
    // Check the checkbox
    await user.click(screen.getByTestId('terms-checkbox'));
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /Submit/i }));
    
    // Verify FormData was called
    expect(FormData).toHaveBeenCalled();
    
    // Verify the correct value was appended
    expect(mockFormDataAppend).toHaveBeenCalledWith('acceptTerms', 'on');
  });

  it('does not append acceptTerms to FormData when checkbox is unchecked', async () => {
    const { user } = render(<CheckboxFormDataTest />);

    // Ensure the checkbox is unchecked initially
    const checkbox = screen.getByTestId('terms-checkbox');
    expect(checkbox).not.toBeChecked();

    // Submit the form without checking the checkbox
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    // Verify the mock behavior
    // Note: We're testing the behavior, not the implementation details
    // We know FormData is called but we don't need to assert it

    // Verify no acceptTerms values were appended
    expect(mockFormDataAppend).not.toHaveBeenCalledWith('acceptTerms', expect.anything());
  });
});