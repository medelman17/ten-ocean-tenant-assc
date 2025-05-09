# Database Migration History

This document tracks the history of database migrations for the 10 Ocean Tenant Association application.

## Migration Process

All schema changes follow this process:

1. Define schema changes in SQL files in the `supabase/schemas/` directory
2. Generate migrations with `npx supabase db diff -f <migration_name>`
3. Review the generated migration in `supabase/migrations/`
4. Apply migrations with `npx supabase db push`
5. Regenerate TypeScript types with `npx supabase gen types typescript --local > types/supabase.ts`

## Migration History

### 20250509231818_tenant_association_schema.sql

**Date:** May 9, 2025  
**Author:** Michael Edelman  
**Description:** Initial schema creation for the 10 Ocean Tenant Association application.

**Major changes:**

- Created tables for user management:
  - `roles` - User roles with permissions
  - `user_profiles` - Extended user profile information
  - `user_roles` - Junction table for role assignment
  - `user_preferences` - User application preferences
  - `user_skills` - User skills and interests
  - `user_connections` - Connections between users
  - `floor_captain_assignments` - Floor captain assignments

- Created tables for physical building:
  - `units` - Residential units/apartments

- Created tables for community features:
  - `events` - Community events
  - `event_attendees` - Event attendance tracking
  - `announcements` - Community announcements
  - `documents` - Shared documents

- Created tables for maintenance system:
  - `maintenance_requests` - Maintenance issue tracking

- Created tables for forum system:
  - `forum_categories` - Forum categories
  - `forum_topics` - Discussion topics
  - `forum_posts` - Individual posts
  - `topic_subscriptions` - Topic subscriptions
  - `category_subscriptions` - Category subscriptions
  - `post_reactions` - Post reactions

- Created tables for survey system:
  - `surveys` - Survey definitions
  - `survey_questions` - Survey questions
  - `survey_responses` - Survey responses
  - `question_responses` - Individual question responses

- Created tables for file management:
  - `files` - File metadata
  - `file_categories` - File categories
  - `file_category_items` - Category assignments
  - `file_attachments` - File attachments to entities

- Created tables for AI chat assistant:
  - `chat_sessions` - Chat sessions
  - `chat_messages` - Chat messages
  - `ai_context_sources` - AI context sources
  - `ai_configuration` - AI configuration

- Created database functions:
  - `update_forum_topic_last_post_time()` - Updates the last post timestamp on forum topics
  - `update_timestamp()` - Updates the updated_at timestamp on modified records

- Enabled Row Level Security on key tables with basic policies

### Future Migrations

Additional migrations will be documented here as they are applied.