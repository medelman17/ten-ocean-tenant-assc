// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock browser APIs that aren't available in the test environment
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

// Mock FormData if not available
if (typeof global.FormData === 'undefined') {
  global.FormData = function FormData() {
    this.data = new Map();

    this.append = function(key, value) {
      this.data.set(key, value);
    };

    this.get = function(key) {
      return this.data.get(key);
    };

    this.has = function(key) {
      return this.data.has(key);
    };

    this.getAll = function(key) {
      return this.data.has(key) ? [this.data.get(key)] : [];
    };
  };
}

// Mock the next/navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '',
}));

// Mock Next.js image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(),
      update: jest.fn(),
    })),
  })),
}));

// Suppress React 19 "useFormState" warnings in tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('useFormState')
  ) {
    return;
  }
  originalConsoleError(...args);
};