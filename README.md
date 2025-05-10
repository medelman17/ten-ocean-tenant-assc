# 10 Ocean Tenant Association

![Build and Test](https://github.com/medelman17/ten-ocean-tenant-assc/actions/workflows/build-and-test.yml/badge.svg)

This is a web application for the 10 Ocean Tenant Association built with Next.js, React 19, TypeScript, Tailwind CSS, and Supabase.

## Getting Started

First, run the development server:

```bash
# Install dependencies
pnpm install

# Run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Development

### Available Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Testing

This project uses Jest and React Testing Library for unit testing. Tests are located in the `__tests__` directory, mirroring the project structure.

For more information about writing tests, see the [`__tests__/README.md`](__tests__/README.md) file.

### Git Hooks

This project uses Husky to manage Git hooks:

- **pre-commit**: Runs linting and tests before each commit
- **pre-push**: Runs tests before pushing to the remote repository

See the [`.husky/README.md`](.husky/README.md) for more details.

### Continuous Integration

This project uses GitHub Actions workflows for continuous integration:

- **Build and Test**: Runs on push to main and on pull requests
- **Code Coverage**: Runs on pull requests to track test coverage

## Learn More

For more information about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

## License

[MIT](LICENSE)
