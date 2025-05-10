# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js web application for the 10 Ocean Tenant Association, a residential community organization. The site is built using modern web technologies:

- Next.js 15 with App Router
- React 19 
- TypeScript
- Tailwind CSS for styling
- Supabase for backend/database
- shadcn/ui components based on Radix UI

## Development Commands

```bash
# Install dependencies (always use pnpm, not npm or yarn)
pnpm install

# Start development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Supabase Commands

```bash
# Start local Supabase services
npx supabase start

# Stop local Supabase services (before generating migrations)
npx supabase stop

# Generate TypeScript types from Supabase schema
npx supabase gen types typescript --local > types/supabase.ts

# Create a new migration by diffing schema changes
npx supabase db diff -f <migration_name>

# Apply migrations to local Supabase
npx supabase db push
```

## Project Structure

The project follows a specific directory structure:

```
├── app/                    # Next.js app router pages and API routes
│   ├── api/               # API routes
│   ├── actions/           # Server actions (public)
│   ├── [route]/          # Route directories
│   │   ├── page.tsx      # Page component
│   │   ├── layout.tsx    # Layout component
│   │   └── components/   # Route-specific components
├── components/            # Shared UI components
│   ├── ui/               # Basic UI components (shadcn/ui)
│   └── [feature]/        # Feature-specific components
├── supabase/              # Supabase schema, migrations, and backend logic
│   ├── migrations/       # Database migrations
│   └── schemas/          # Declarative database schemas
├── lib/                   # Utility functions and services
│   ├── services/         # Business logic and data services
│   ├── validations/      # Form and data validation
│   ├── supabase/         # Supabase client configuration
│   └── config/           # Configuration files
├── types/                # TypeScript type definitions
└── public/              # Static assets
```

## Key Development Guidelines

### Next.js Pages

- Page props should be typed with Promise for params and searchParams
- Main page components should be async functions
- Client-side state management should be in separate client components
- Server components should fetch data and pass it to client components

Example:
```typescript
interface PageProps {
  params: Promise<{
    slug: string
  }>,
  searchParams?: Promise<{
    query?: string
  }>
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { query } = await searchParams || {}

  // Server-side data fetching here
  const data = await getData(slug)

  return (
    <ClientComponent data={data} />
  )
}

'use client'
function ClientComponent({ data }: { data: Data }) {
  // Client-side state management here
  const [state, setState] = useState()
  
  return (
    // JSX
  )
}
```

### Supabase Authentication

This project uses the Supabase Auth with SSR. Critical rules for working with auth:

1. Always use `@supabase/ssr` package, NOT `@supabase/auth-helpers-nextjs`
2. Always use `getAll` and `setAll` for cookie handling, NEVER `get`, `set`, or `remove`
3. Follow the established pattern for creating browser and server clients
4. See `/lib/supabase/client.ts` and `/lib/supabase/server.ts` for reference implementations

### Database & Type Safety

1. Database uses snake_case (e.g., `user_id`), while application code uses camelCase (e.g., `userId`)
2. Use transformation utilities in `lib/utils/case-transforms.ts`:
   - `toCamelCase()` for DB → App conversions
   - `toSnakeCase()` for App → DB conversions
3. Generated Supabase types are in `types/supabase.ts`

### Database Migrations

1. Use the declarative schema approach:
   - Define schema in `.sql` files in `supabase/schemas/`
   - Generate migrations with `supabase db diff`
   - Don't directly modify files in `supabase/migrations/`

2. When writing database functions:
   - Default to `SECURITY INVOKER`
   - Always set `search_path = ''`
   - Use fully qualified names for database objects
   - Minimize side effects

### UI Components

Use shadcn/ui components as the primary UI library:

1. Install components with: `pnpm dlx shadcn@latest add <component-name>`
2. Import from `@/components/ui/<component-name>`
3. Style only with Tailwind classes (no CSS files or inline styles)
4. Ensure components are accessible with proper ARIA attributes

### General Code Guidelines

1. Use pnpm, not npm or yarn
2. File naming uses kebab-case
3. Keep files under 300 lines of code
4. No TODOs or placeholders in production code
5. Code must be DRY, bug-free, and easy to read
6. Use early returns for better readability
7. Add proper TypeScript types

## MCP Servers

This project makes use of the following Message Control Protocol (MCP) servers:

```json
{
    "mcpServers": {
        "supabase": {
            "command": "npx",
            "args": [
                "-y",
                "@supabase/mcp-server-supabase@latest",
                "--access-token",
                "YOUR_SUPABASE_ACCESS_TOKEN_HERE"
            ]
        },
        "memory": {
            "command": "docker",
            "args": [
                "run",
                "-i",
                "--rm",
                "mcp/memory"
            ]
        },
        "sequentialthinking": {
            "command": "docker",
            "args": [
                "run",
                "-i",
                "--rm",
                "mcp/sequentialthinking"
            ]
        }
    }
}
```

### Memory Usage Protocol

IMPORTANT: When working on tasks, always follow this memory protocol:

1. **Check Memory Before Starting**: Always check the memory using the memory tool before starting any task. This ensures you have the most up-to-date context and don't duplicate previous work.

2. **Update Memory After Completion**: Always update the memory just before completing a task. This maintains continuity across sessions and ensures critical context is preserved.

### Available MCP Tools

1. **supabase** - For direct interaction with Supabase database (read-only access).
   - Use this for database queries and schema inspection.
   - NEVER use this tool to write to the database.

2. **memory** - Docker-based memory service for state persistence.
   - Essential for maintaining context between sessions.
   - Follow the memory protocol above for every task.

3. **sequentialthinking** - Docker-based sequential thinking service.