# Unit Testing with Jest and React Testing Library

This project uses Jest and React Testing Library for unit testing. This README explains how to run tests and write new ones.

## Running Tests

To run all tests:

```bash
pnpm test
```

To run tests with watch mode (automatically rerun when files change):

```bash
pnpm test:watch
```

To run tests with coverage:

```bash
pnpm test:coverage
```

To run specific tests by filename pattern:

```bash
pnpm test -- checkbox
```

## Directory Structure

Tests are organized in the `__tests__` directory, mirroring the project structure:

```
__tests__/
├── app/                  # Tests for pages and components in app directory
│   ├── login/            # Tests for login page
│   └── register/         # Tests for register page
├── components/           # Tests for shared components
│   └── ui/               # Tests for UI components
└── README.md             # This file
```

## Writing Tests

### Basic Test Structure

```tsx
import React from 'react';
import { render, screen } from '@/lib/utils/test-utils';
import { ComponentToTest } from '@/path/to/component';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentToTest />);
    expect(screen.getByText('Some Text')).toBeInTheDocument();
  });
});
```

### Using Custom Render Function

Always use the custom render function from `@/lib/utils/test-utils` instead of importing directly from `@testing-library/react`. This ensures that components are wrapped with the necessary providers.

```tsx
import { render, screen } from '@/lib/utils/test-utils';
```

### Testing User Interactions

Use the `user` object returned from the custom render function to simulate user interactions:

```tsx
it('handles user interaction', async () => {
  const { user } = render(<ComponentToTest />);
  
  await user.click(screen.getByRole('button'));
  expect(screen.getByText('Clicked')).toBeInTheDocument();
});
```

### Mocking

#### Mocking Components

For components that depend on other components, you can mock those dependencies:

```tsx
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }) => (
    <button data-testid="mock-button" {...props}>{children}</button>
  ),
}));
```

#### Mocking Server Actions

For server actions, use Jest's mock functions:

```tsx
jest.mock('@/app/login/actions', () => ({
  login: jest.fn(),
}));

// In your test:
it('calls the login action', async () => {
  const { user } = render(<LoginForm />);
  
  // Fill form fields
  await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/Password/i), 'password123');
  
  // Submit form
  await user.click(screen.getByRole('button', { name: /Sign In/i }));
  
  // Check if action was called
  expect(login).toHaveBeenCalled();
});
```

### Testing Form Validation

Use `waitFor` to test asynchronous validation:

```tsx
it('displays validation errors', async () => {
  const { user } = render(<FormComponent />);
  
  // Submit without filling required fields
  await user.click(screen.getByRole('button', { name: /Submit/i }));
  
  // Check for validation errors
  await waitFor(() => {
    expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
  });
});
```

### Common Patterns

#### Testing Checkbox Components

When testing checkboxes with form submission, pay special attention to how values are handled during form submission:

```tsx
it('correctly handles checkbox value in form submission', async () => {
  const { user } = render(<FormWithCheckbox />);
  
  // Check the checkbox
  await user.click(screen.getByRole('checkbox'));
  expect(screen.getByRole('checkbox')).toBeChecked();
  
  // Submit the form
  await user.click(screen.getByRole('button', { name: /Submit/i }));
  
  // Verify form submission logic
  expect(handleSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ acceptTerms: true })
  );
});
```

## Best Practices

1. **Test behavior, not implementation**: Focus on what the component does, not how it's built
2. **Use semantic queries**: Prefer `getByRole`, `getByLabelText`, `getByText` over `getByTestId`
3. **Test for accessibility**: Ensure components can be accessed via keyboard and screen readers
4. **Keep tests focused**: Each test should verify one specific behavior
5. **Mock external dependencies**: API calls, server actions, and complex components should be mocked
6. **Clear mocks between tests**: Use `beforeEach(() => jest.clearAllMocks())` to reset mocks
7. **Test edge cases**: Make sure to test error states, loading states, and empty states
8. **Use test-specific attributes sparingly**: Only add `data-testid` when no semantic query will work

## Useful Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Common Testing Library Queries](https://testing-library.com/docs/queries/about)
- [User Event Documentation](https://testing-library.com/docs/user-event/intro)