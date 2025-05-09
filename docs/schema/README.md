# Database Schema Documentation

This documentation provides a comprehensive overview of the 10 Ocean Tenant Association database schema.

## Schema Overview

The database schema is designed around several core entities that represent the main components of the tenant association application:

1. **Users and Authentication** - User accounts, profiles, roles, and verification
2. **Units/Apartments** - Physical residential units in the building
3. **Community Features** - Events, announcements, and documents
4. **Maintenance** - Maintenance requests and tracking
5. **Forums** - Discussion categories, topics, and posts
6. **Surveys** - Feedback collection and voting
7. **Files and Media** - Document and media management
8. **AI Chat Assistant** - Contextual AI assistance for residents

## Schema Diagram

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────────┐
│ User Management │     │ Community    │     │ Maintenance      │
│ - user_profiles │     │ - events     │     │ - requests       │
│ - user_roles    │     │ - documents  │     │ - assignments    │
│ - user_skills   │     │ - announcements│   └──────────────────┘
└─────────────────┘     └──────────────┘
        │                      │                     │
        │                      │                     │
        ▼                      ▼                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Files & Media                          │
│ - files          - file_categories    - file_attachments │
└─────────────────────────────────────────────────────────┘
        ▲                      ▲                     ▲
        │                      │                     │
        │                      │                     │
┌─────────────────┐     ┌──────────────┐     ┌──────────────────┐
│ Forums          │     │ Surveys      │     │ AI Chat          │
│ - categories    │     │ - surveys    │     │ - sessions       │
│ - topics        │     │ - questions  │     │ - messages       │
│ - posts         │     │ - responses  │     │ - context_sources │
└─────────────────┘     └──────────────┘     └──────────────────┘
```

## Core Design Principles

1. **Flexibility** - The schema supports a wide range of community features
2. **Security** - Row-level security policies control access to sensitive data
3. **Extensibility** - Design allows for future features without major schema changes
4. **Performance** - Appropriate indexes on frequently queried fields
5. **Integrity** - Foreign key constraints ensure data consistency

## Detailed Documentation

- [Authentication and User Management](./auth.md)
- [Data Models and Relationships](./data-models.md)
- [Row-Level Security Policies](./policies.md)
- [Entity-Specific Documentation](./entities/README.md)

## Schema Evolution

The database schema is managed through Supabase migrations. All schema changes should follow these guidelines:

1. Define schema changes in SQL files in the `supabase/schemas/` directory
2. Generate migrations with `npx supabase db diff`
3. Apply migrations with `npx supabase db push`
4. Regenerate TypeScript types with `npx supabase gen types typescript`

## TypeScript Integration

The database schema is reflected in TypeScript types via the generated `types/supabase.ts` file, ensuring type safety throughout the application.

## Common Queries

See [Common Queries](./queries.md) for examples of frequently used database queries and operations.