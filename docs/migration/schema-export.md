# Supabase Schema Export Documentation

**Migration:** Ten Ocean Tenant Association - Supabase to Neon + Prisma  
**Export Date:** January 2025  
**Status:** Complete baseline for migration  

## Overview

This document contains the complete export of the current Supabase database schema including:
- 32 total tables
- Complex relational structure
- Row Level Security (RLS) policies
- Custom functions and triggers
- Performance indexes

## Schema Summary

### Core Tables Structure

1. **User & Authentication (5 tables)**
   - `user_profiles` - Main user information
   - `user_preferences` - User settings and preferences  
   - `user_skills` - User skills and interests
   - `user_roles` - Role assignments
   - `user_connections` - User relationships

2. **RBAC System (3 tables)**
   - `roles` - System roles (Admin, FloorCaptain, Resident)
   - `floor_captain_assignments` - Floor captain assignments
   - `user_roles` - User-role mappings

3. **Building Management (3 tables)**
   - `units` - Apartment units
   - `maintenance_requests` - Maintenance system
   - `announcements` - Building announcements

4. **Forum System (6 tables)**
   - `forum_categories` - Forum categories
   - `forum_topics` - Discussion topics
   - `forum_posts` - Forum posts
   - `post_reactions` - Post reactions/likes
   - `category_subscriptions` - Category subscriptions
   - `topic_subscriptions` - Topic subscriptions

5. **Event Management (2 tables)**
   - `events` - Event information
   - `event_attendees` - RSVP system

6. **File Management (4 tables)**
   - `files` - File storage metadata
   - `file_categories` - File categorization
   - `file_category_items` - File-category mapping
   - `file_attachments` - File attachments to entities

7. **Surveys & Comments (5 tables)**
   - `surveys` - Survey definitions
   - `survey_questions` - Survey questions
   - `survey_responses` - Survey responses
   - `question_responses` - Individual question answers
   - `comments` - Generic commenting system

8. **AI & Chat (4 tables)**
   - `ai_configuration` - AI model configuration
   - `ai_context_sources` - AI knowledge sources
   - `chat_sessions` - User chat sessions
   - `chat_messages` - Chat message history

9. **Membership & Documents (4 tables)**
   - `alumni_membership_tiers` - Membership tiers
   - `user_memberships` - User membership status
   - `documents` - Document management

## Key Schema Features

### 1. Authentication Integration
- Uses Supabase Auth system (`auth.users`)
- `user_profiles.id` references `auth.users.id`
- RLS policies use `auth.uid()` function

### 2. Multi-Tenant Architecture
- Building-based organization via `units` table
- Floor-based permissions via `floor_captain_assignments`
- Privacy levels: `public`, `residents`, `floor`, `private`

### 3. Complex Relationships
- **One-to-Many:** User → Posts, User → Events, Unit → Users
- **Many-to-Many:** Users ↔ Roles, Files ↔ Categories, Events ↔ Attendees
- **Polymorphic:** Comments (can attach to any entity), File Attachments

### 4. Performance Optimizations
- Strategic indexes on frequently queried columns
- Composite indexes for complex queries
- JSONB fields for flexible data storage

### 5. Data Integrity
- Foreign key constraints
- Unique constraints on natural keys
- Check constraints for enum-like fields

## Row Level Security (RLS) Policies

### User Profile Access
1. **Admin Access:** Admins can view all profiles
2. **Floor Captain Access:** Can view profiles on their assigned floors
3. **Self Access:** Users can view their own profile
4. **Verified Resident Access:** Verified users can view other verified residents

### Privacy Levels
- `public` - Visible to all authenticated users
- `residents` - Visible to verified residents only
- `floor` - Visible to floor captains and same-floor residents
- `private` - Visible to user and admins only

## Custom Functions & Triggers

### 1. Update Timestamp Function
```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;
```

### 2. Forum Topic Update Trigger
Automatically updates `last_post_at` when new posts are created.

## Migration Considerations

### 1. UUID Dependencies
- All primary keys use UUIDs
- Requires `uuid-ossp` extension
- Prisma handles UUID generation differently

### 2. JSONB Fields
- Extensive use of JSONB for flexible data
- Need to maintain JSON schema validation
- Prisma JSON type mapping required

### 3. Authentication Migration
- Supabase `auth.uid()` → Custom auth solution
- RLS policies need conversion to application-level security
- User session management changes

### 4. Real-time Features
- Supabase Realtime subscriptions
- Need WebSocket or SSE alternative
- Forum/chat real-time updates

### 5. File Storage
- Supabase Storage integration
- File metadata preservation
- Storage URL migration

## Prisma Schema Mapping Status

✅ **Completed:**
- All table structures converted
- Relationships properly mapped
- Indexes and constraints defined
- Data types correctly converted

🔄 **In Progress:**
- RLS policy conversion to application logic
- Custom function migration
- Trigger replacement strategies

⏳ **Pending:**
- Authentication system integration
- File storage migration
- Real-time feature implementation

## Next Steps

1. **Schema Deployment:** Push Prisma schema to Neon database
2. **Data Migration:** Create migration scripts for existing data
3. **Authentication Integration:** Set up new auth system
4. **RLS Conversion:** Implement application-level security
5. **Testing:** Comprehensive data integrity testing

---

*This export serves as the definitive reference for the current schema state and migration requirements.* 