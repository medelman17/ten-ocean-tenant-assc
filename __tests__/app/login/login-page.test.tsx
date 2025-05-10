/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@/lib/utils/test-utils';
import LoginPage from '@/app/login/page';
import { login } from '@/app/login/actions';

// Mock the login action
jest.mock('@/app/login/actions', () => ({
  login: jest.fn(),
}));

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful login by default
    (login as jest.Mock).mockImplementation(() => {
      // The action redirects on success, so it doesn't return anything
      return undefined;
    });
  });

  it('renders the login form', () => {
    render(<LoginPage />);
    
    // Check that all form elements are present
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByText(/Forgot password/i)).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
  });

  it('displays validation errors for empty fields', async () => {
    const { user } = render(<LoginPage />);
    
    // Submit the form without filling any fields
    await user.click(screen.getByRole('button', { name: /Sign In/i }));
    
    // Check that validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('submits the form successfully with valid data', async () => {
    const { user } = render(<LoginPage />);
    
    // Fill in all required fields
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'Password123');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /Sign In/i }));
    
    // Check that the login action was called with the correct data
    await waitFor(() => {
      expect(login).toHaveBeenCalled();
    });
  });

  it('displays an error message when login fails', async () => {
    // Mock failed login
    (login as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Invalid email or password',
    });
    
    const { user } = render(<LoginPage />);
    
    // Fill in all required fields
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'WrongPassword123');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /Sign In/i }));
    
    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });
});