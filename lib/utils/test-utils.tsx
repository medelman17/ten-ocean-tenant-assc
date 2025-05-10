import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Add providers here if needed
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <>{children}</>
  );
};

/**
 * Custom render function that includes global providers
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllTheProviders, ...options })
  };
};

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

// Override render method
export { customRender as render };