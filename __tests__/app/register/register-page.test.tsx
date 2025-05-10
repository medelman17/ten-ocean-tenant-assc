/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@/lib/utils/test-utils';
import RegisterPage from '@/app/register/page';
import { register } from '@/app/register/actions';

// Mock the register action
jest.mock('@/app/register/actions', () => ({
  register: jest.fn(),
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful registration by default
    (register as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Registration successful! Please check your email to confirm your account.',
    });
  });

  it('renders the registration form', () => {
    render(<RegisterPage />);

    // Check that all form elements are present
    expect(screen.getByText('Create an account')).toBeInTheDocument();
    expect(screen.getByLabelText(/First name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();

    // Get password by ID instead of label text to avoid matching both password fields
    expect(screen.getByTestId('password-field')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-password-field')).toBeInTheDocument();

    expect(screen.getByLabelText(/I agree to the terms and conditions/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create account/i })).toBeInTheDocument();
  });

  it('displays validation errors for empty fields', async () => {
    const { user } = render(<RegisterPage />);
    
    // Submit the form without filling any fields
    await user.click(screen.getByRole('button', { name: /Create account/i }));
    
    // Check that validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/First name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/You must accept the terms and conditions/i)).toBeInTheDocument();
    });
  });

  it('submits the form successfully with valid data', async () => {
    const { user } = render(<RegisterPage />);

    // Fill in all required fields
    await user.type(screen.getByLabelText(/First name/i), 'John');
    await user.type(screen.getByLabelText(/Last name/i), 'Doe');
    await user.type(screen.getByLabelText(/Email/i), 'john.doe@example.com');
    await user.type(screen.getByTestId('password-field'), 'Password123');
    await user.type(screen.getByTestId('confirm-password-field'), 'Password123');
    await user.click(screen.getByLabelText(/I agree to the terms and conditions/i));

    // Submit the form
    await user.click(screen.getByRole('button', { name: /Create account/i }));

    // Check that the register action was called with the correct data
    await waitFor(() => {
      expect(register).toHaveBeenCalled();

      // Check for success message
      expect(screen.getByText(/Registration successful/i)).toBeInTheDocument();
    });
  });

  it('displays an error message when registration fails', async () => {
    // Mock failed registration
    (register as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Email already in use',
    });

    const { user } = render(<RegisterPage />);

    // Fill in all required fields
    await user.type(screen.getByLabelText(/First name/i), 'John');
    await user.type(screen.getByLabelText(/Last name/i), 'Doe');
    await user.type(screen.getByLabelText(/Email/i), 'existing@example.com');
    await user.type(screen.getByTestId('password-field'), 'Password123');
    await user.type(screen.getByTestId('confirm-password-field'), 'Password123');
    await user.click(screen.getByLabelText(/I agree to the terms and conditions/i));

    // Submit the form
    await user.click(screen.getByRole('button', { name: /Create account/i }));

    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Email already in use/i)).toBeInTheDocument();
    });
  });

  it('validates password requirements', async () => {
    const { user } = render(<RegisterPage />);

    // Fill form with weak password
    await user.type(screen.getByLabelText(/First name/i), 'John');
    await user.type(screen.getByLabelText(/Last name/i), 'Doe');
    await user.type(screen.getByLabelText(/Email/i), 'john.doe@example.com');
    await user.type(screen.getByTestId('password-field'), 'password');
    await user.type(screen.getByTestId('confirm-password-field'), 'password');
    await user.click(screen.getByLabelText(/I agree to the terms and conditions/i));

    // Submit the form
    await user.click(screen.getByRole('button', { name: /Create account/i }));

    // Check for password validation error
    await waitFor(() => {
      expect(screen.getByText(/Password must contain at least one uppercase letter/i)).toBeInTheDocument();
    });
  });

  it('validates matching passwords', async () => {
    const { user } = render(<RegisterPage />);

    // Fill form with mismatched passwords
    await user.type(screen.getByLabelText(/First name/i), 'John');
    await user.type(screen.getByLabelText(/Last name/i), 'Doe');
    await user.type(screen.getByLabelText(/Email/i), 'john.doe@example.com');
    await user.type(screen.getByTestId('password-field'), 'Password123');
    await user.type(screen.getByTestId('confirm-password-field'), 'Password456');
    await user.click(screen.getByLabelText(/I agree to the terms and conditions/i));

    // Submit the form
    await user.click(screen.getByRole('button', { name: /Create account/i }));

    // Check for password mismatch error
    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });
});