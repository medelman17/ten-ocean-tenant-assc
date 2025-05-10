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
- Inngest for event-driven workflows
- Zod for validation

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

### Database Environment Script

The project includes a helper script for managing database operations with proper environment variables:

```bash
# Push migrations to the database (uses environment variables)
pnpm db:push

# Pull the current database schema (uses environment variables)
pnpm db:pull

# Generate TypeScript types from the current schema
pnpm db:types
```

This script loads environment variables from `.env.local` and `.env` files and sets up the correct database password for Supabase CLI operations. Use these commands instead of direct `npx supabase` commands for production or staging environments.

## Project Structure

The project follows a specific directory structure:

```
├── app/                    # Next.js app router pages and API routes
│   ├── api/               # API routes
│   │   └── inngest/       # Inngest API endpoint for event processing
│   ├── actions/           # Server actions (public)
│   ├── [route]/          # Route directories
│   │   ├── page.tsx      # Page component
│   │   ├── actions.ts    # Route-specific server actions
│   │   ├── layout.tsx    # Layout component
│   │   └── components/   # Route-specific components
├── components/            # Shared UI components
│   ├── ui/               # Basic UI components (shadcn/ui)
│   └── [feature]/        # Feature-specific components
├── docs/                  # Development documentation
├── supabase/              # Supabase schema, migrations, and backend logic
│   ├── migrations/       # Database migrations
│   └── schemas/          # Declarative database schemas
├── lib/                   # Utility functions and services
│   ├── components/       # Higher-order components and providers
│   ├── inngest/          # Event-driven workflow definitions
│   │   ├── client.ts     # Inngest client setup
│   │   ├── events.ts     # Event type definitions
│   │   └── functions/    # Workflow implementations
│   ├── services/         # Business logic and data services
│   ├── types/            # Internal TypeScript types
│   ├── utils/            # Utility functions
│   ├── validations/      # Form and data validation schemas
│   └── supabase/         # Supabase client configuration
├── types/                # Generated TypeScript type definitions
└── public/              # Static assets
```

## Key Development Guidelines

### Authentication and Authorization

This project implements a comprehensive authentication and authorization system:

1. **Authentication**: Uses Supabase Auth with email/password sign-up and signin
   - Authentication is implemented using `@supabase/ssr` for Next.js App Router
   - User verification via email confirmation
   - Password requirements defined in validation schemas
   - Middleware-based route protection

2. **Role-Based Access Control (RBAC)**: Multi-layered authorization system
   - Four predefined roles: Admin, FloorCaptain, Resident, Alumni
   - Permission-based actions stored as JSONB in the database
   - Server-side middleware protection for route access
   - Client-side withRole HOC for component protection
   - RoleProvider context for conditional UI rendering

3. **User Verification Workflow**:
   - New users start with "pending" verification status
   - Admin or FloorCaptain approval required via dashboard
   - Floor-specific verification by FloorCaptains
   - Event-driven notification system

For details, see `/docs/role-based-access-control.md`.

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

### Event-Driven Workflows with Inngest

This project uses Inngest for event-driven workflows, primarily for user-related processes:

1. **Event Schema**: Events are defined in `/lib/inngest/events.ts`
   - Structured event data with TypeScript typing
   - Consistent event naming pattern (`domain/action.modifier`)

2. **Workflow Implementation**: Functions in `/lib/inngest/functions/`
   - Step-based implementation for reliable execution
   - Error handling and retries built in
   - Proper TypeScript typing for data safety

3. **Key Workflows**:
   - User registration and verification
   - Approval/rejection notification
   - Email notifications
   - Event management

4. **API Integration**: Endpoint at `/api/inngest/route.ts`
   - Centralized registration of all workflows
   - Secure webhook handling

When adding new workflows, follow the existing patterns and ensure events have proper type definitions.

### Supabase Authentication

This project uses the Supabase Auth with SSR. Critical rules for working with auth:

1. Always use `@supabase/ssr` package, NOT `@supabase/auth-helpers-nextjs`
2. Always use `getAll` and `setAll` for cookie handling, NEVER `get`, `set`, or `remove`
3. Follow the established pattern for creating browser and server clients
4. See `/lib/supabase/client.ts` and `/lib/supabase/server.ts` for reference implementations
5. For non-browser contexts, use the service client: `/lib/supabase/service-client.ts`

### Server Actions

The application uses Next.js server actions for forms and data mutations:

1. **Action Pattern**:
   - "use server" directive at the top of the file
   - Form data validation with Zod schemas
   - Type-safe error handling and response
   - Typed return values with success/error fields

2. **Key Actions**:
   - Authentication: `/app/login/actions.ts`, `/app/register/actions.ts`
   - Admin functions: `/app/dashboard/admin/verify-users/actions.ts`

3. **Validation**:
   - Form schemas defined in `/lib/validations/`
   - Zod for runtime type validation
   - Custom validation messages

### Database & Type Safety

1. Database uses snake_case (e.g., `user_id`), while application code uses camelCase (e.g., `userId`)
2. Use transformation utilities in `lib/utils/case-transforms.ts`:
   - `toCamelCase()` for DB → App conversions
   - `toSnakeCase()` for App → DB conversions
3. Generated Supabase types are in `types/supabase.ts`
4. Custom internal types in `lib/types/`
   - Extended database types with utility types for joins
   - Role and permission types
   - Event payload types

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

3. Managing database credentials:
   - Store your database password in `.env.local` as `POSTGRES_PASSWORD`
   - Use the `pnpm db:*` commands which handle credential management
   - Never hardcode database credentials in scripts or migrations
   - For local development, use `supabase start` which sets up local credentials automatically

4. Row-Level Security (RLS):
   - Define policies for each table
   - Use role-based permissions
   - Ensure proper filtering by user ID
   - Important tables with RLS policies:
     - `user_profiles`: Controls who can view, create, and update user profiles
     - `roles`: Controls who can assign and view roles
     - `permissions`: Controls who can modify permission settings

### UI Components

Use shadcn/ui components as the primary UI library:

1. Install components with: `pnpm dlx shadcn@latest add <component-name>`
2. Import from `@/components/ui/<component-name>`
3. Style only with Tailwind classes (no CSS files or inline styles)
4. Ensure components are accessible with proper ARIA attributes
5. For conditional rendering based on roles, use the `useRole` hook

### Forms and Validation

1. Use `react-hook-form` for form state management
2. Use Zod for schema validation
3. Define schemas in `lib/validations/` directory
4. Form components should handle their own submission state
5. Use server actions for form submissions

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
                "YOUR_SUPABASE_ACCESS_TOKEN"
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