# Data Models and Relationships

This document provides detailed information about the core data models in the 10 Ocean Tenant Association application and how they relate to each other.

## Core Entity Relationships

The application is built around several key entities that form the foundation of the data model. The diagram below shows the high-level relationships between these core entities:

```
                    ┌─────────────┐
                    │   Users     │
                    └─────────────┘
                          │
                          │ owns/manages
                          ▼
┌─────────┐      ┌─────────────┐      ┌─────────────┐
│  Roles  │◄────►│    Units    │◄────►│   Forums    │
└─────────┘      └─────────────┘      └─────────────┘
                          │                  │
                          │ associated with  │
                          ▼                  ▼
                    ┌─────────────┐    ┌─────────────┐
                    │ Maintenance │    │   Events    │
                    └─────────────┘    └─────────────┘
                          │                  │
                          │                  │
                          ▼                  ▼
                    ┌─────────────────────────────┐
                    │         Documents           │
                    └─────────────────────────────┘
```

## User-Related Models

### User Profiles

```sql
CREATE TABLE user_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    display_name TEXT,
    phone TEXT,
    unit_id uuid REFERENCES units(id) ON DELETE SET NULL,
    profile_picture_url TEXT,
    bio TEXT,
    /* ...additional fields... */
);
```

Users are the central entity in the system. Each user:
- Has one profile (1:1 relationship with auth.users)
- May be associated with one unit (N:1 relationship with units)
- Can have multiple roles (N:M relationship through user_roles)
- May have skills and interests (1:1 relationship with user_skills)
- Has preferences (1:1 relationship with user_preferences)

### User Skills & Interests

```sql
CREATE TABLE user_skills (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skills TEXT[],
    interests TEXT[],
    community_involvement TEXT[],
    volunteer_availability JSONB DEFAULT '{}'
);
```

This model tracks users' skills, interests, and community involvement, enabling:
- Community directory filtering
- Volunteer matching
- Interest-based group formation

### User Connections

```sql
CREATE TABLE user_connections (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    connected_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    established_at TIMESTAMPTZ,
    /* ...additional fields... */
    CONSTRAINT different_users CHECK (user_id <> connected_user_id),
    UNIQUE(user_id, connected_user_id)
);
```

This model enables a social network within the building:
- Residents can connect with each other
- Alumni can maintain connections with current residents
- Facilitates community building

## Physical Building Models

### Units/Apartments

```sql
CREATE TABLE units (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_number TEXT NOT NULL UNIQUE,
    floor INTEGER NOT NULL,
    square_footage INTEGER,
    bedrooms INTEGER,
    bathrooms NUMERIC(3,1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Units represent the physical apartments in the building:
- Each unit may have multiple residents over time
- Units are associated with a specific floor
- Maintenance requests are linked to units

## Community Features

### Events

```sql
CREATE TABLE events (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location TEXT,
    max_attendees INTEGER,
    is_private BOOLEAN DEFAULT FALSE,
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    /* ...additional fields... */
    CONSTRAINT valid_timespan CHECK (end_time > start_time)
);

CREATE TABLE event_attendees (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'going',
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);
```

Events model community gatherings:
- Each event has a creator (N:1 relationship with users)
- Events have attendees (N:M relationship through event_attendees)
- Events may have attachments (through file_attachments)

### Announcements

```sql
CREATE TABLE announcements (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal',
    is_pinned BOOLEAN DEFAULT FALSE,
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);
```

Announcements communicate important information:
- Each announcement has an author (N:1 relationship with users)
- Announcements can have different priority levels
- Announcements can expire automatically

### Documents

```sql
CREATE TABLE documents (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Documents store important community resources:
- Associated with files through the files table
- Organized by category
- Can be shared with specific user groups

## Maintenance System

### Maintenance Requests

```sql
CREATE TABLE maintenance_requests (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT NOT NULL DEFAULT 'medium',
    unit_id uuid REFERENCES units(id) ON DELETE SET NULL,
    reported_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Maintenance requests track building issues:
- Each request is associated with a unit (N:1 relationship)
- Requests have a reporter and optional assignee (N:1 relationships with users)
- Requests have a status and priority
- Requests can have attached files (through file_attachments)

## Discussion Forum

### Forum Categories

```sql
CREATE TABLE forum_categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT NOT NULL UNIQUE,
    icon_file_id uuid REFERENCES files(id) ON DELETE SET NULL,
    parent_category_id uuid REFERENCES forum_categories(id) ON DELETE SET NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_private BOOLEAN DEFAULT FALSE,
    required_role_id uuid REFERENCES roles(id) ON DELETE SET NULL
);
```

Forum categories organize discussions:
- Categories can be nested (self-referential relationship)
- Categories can be restricted to specific roles
- Categories have topics (1:N relationship with forum_topics)

### Forum Topics

```sql
CREATE TABLE forum_topics (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category_id uuid NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
    author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_post_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    view_count INTEGER NOT NULL DEFAULT 0,
    slug TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'open'
);
```

Forum topics are individual discussion threads:
- Each topic belongs to a category (N:1 relationship)
- Topics have an author (N:1 relationship with users)
- Topics contain posts (1:N relationship with forum_posts)
- Users can subscribe to topics (N:M relationship through topic_subscriptions)

### Forum Posts

```sql
CREATE TABLE forum_posts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id uuid NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
    author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_edited BOOLEAN DEFAULT FALSE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_solution BOOLEAN DEFAULT FALSE,
    parent_post_id uuid REFERENCES forum_posts(id) ON DELETE SET NULL
);
```

Forum posts are individual messages:
- Each post belongs to a topic (N:1 relationship)
- Posts have an author (N:1 relationship with users)
- Posts can be nested as replies (self-referential relationship)
- Posts can receive reactions (1:N relationship with post_reactions)

## Survey System

### Surveys

```sql
CREATE TABLE surveys (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    published BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'draft'
);
```

Surveys collect feedback and votes:
- Each survey has a creator (N:1 relationship with users)
- Surveys contain questions (1:N relationship with survey_questions)
- Surveys receive responses (1:N relationship with survey_responses)

### Survey Questions

```sql
CREATE TABLE survey_questions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL,
    required BOOLEAN DEFAULT FALSE,
    order_position INTEGER NOT NULL DEFAULT 0,
    options JSONB DEFAULT NULL
);
```

Survey questions:
- Each question belongs to a survey (N:1 relationship)
- Questions have different types (text, multiple choice, etc.)
- Questions can have predefined options

### Survey Responses

```sql
CREATE TABLE survey_responses (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(survey_id, user_id)
);

CREATE TABLE question_responses (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_response_id uuid NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
    question_id uuid NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
    answer_text TEXT,
    selected_options JSONB DEFAULT NULL,
    UNIQUE(survey_response_id, question_id)
);
```

Survey responses track user submissions:
- Each response is from one user for one survey
- Responses contain answers to questions
- The system enforces one response per user per survey

## File Management

### Files

```sql
CREATE TABLE files (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sha256_hash TEXT,
    metadata JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'processing',
    privacy_level TEXT NOT NULL DEFAULT 'residents'
);
```

The files table stores file metadata:
- Each file has an uploader (N:1 relationship with users)
- Files have a type and privacy level
- Files can be attached to various entities (through file_attachments)
- Files can be categorized (N:M relationship through file_category_items)

### File Attachments

```sql
CREATE TABLE file_attachments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id uuid NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    attachable_type TEXT NOT NULL,
    attachable_id uuid NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    added_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

File attachments implement a polymorphic relationship:
- Allows files to be attached to any entity type
- Tracks who added the attachment
- Supports ordering for display purposes

## AI Chat Assistant

### Chat Sessions

```sql
CREATE TABLE chat_sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_archived BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'
);
```

Chat sessions track conversations with the AI assistant:
- Each session belongs to one user (N:1 relationship)
- Sessions contain messages (1:N relationship with chat_messages)
- Sessions can be archived for organization

### Chat Messages

```sql
CREATE TABLE chat_messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    referenced_documents JSONB DEFAULT '[]'
);
```

Chat messages store the conversation:
- Each message belongs to a session (N:1 relationship)
- Messages have a role (user, assistant, system)
- Messages can reference documents used by the AI

### AI Context Sources

```sql
CREATE TABLE ai_context_sources (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    source_type TEXT NOT NULL,
    content_path TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    priority INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    update_frequency TEXT NOT NULL DEFAULT 'manual',
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

AI context sources define information available to the AI:
- Sources can be documents, database queries, or APIs
- Sources have a priority for resolving conflicts
- Sources can be updated on different schedules