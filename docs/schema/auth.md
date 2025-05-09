# Authentication and User Management

This document details the authentication system and user management features of the 10 Ocean Tenant Association application.

## Authentication Flow

The application uses Supabase Auth with server-side rendering (SSR) to handle authentication. The key components of the authentication system are:

1. **Sign Up** - Users register with email/password
2. **Email Verification** - Verify email address through Supabase Auth's built-in verification
3. **Admin Verification** - Admins or floor captains verify user accounts before granting full access
4. **Login** - Email/password authentication
5. **Session Management** - JWT-based sessions with middleware for protected routes

### Authentication Tables

Authentication primarily relies on Supabase Auth tables with extensions for application-specific needs:

| Table | Purpose |
|-------|---------|
| `auth.users` | Core user accounts (managed by Supabase Auth) |
| `public.user_profiles` | Extended user profile information |
| `public.user_roles` | User role assignments |
| `public.roles` | Available roles and permissions |

## User Verification

A key feature of the system is the multi-step verification process:

1. **Self-Registration** - User creates an account and verifies email
2. **Admin Review** - Admin or floor captain verifies the user belongs to the building
3. **Unit Association** - User is associated with their apartment unit
4. **Role Assignment** - Appropriate roles are assigned to the user

### Verification Status Flow

```
┌──────────┐      ┌────────────┐      ┌───────────┐
│ Pending  │ ───► │ Approved   │ ───► │ Active    │
└──────────┘      └────────────┘      └───────────┘
      │                  │
      │                  │
      ▼                  ▼
┌──────────┐      ┌────────────┐
│ Rejected │      │ Suspended  │
└──────────┘      └────────────┘
```

## Roles and Permissions

The system uses a role-based access control (RBAC) model with the following base roles:

| Role | Description | Key Permissions |
|------|-------------|----------------|
| Admin | Full system administrator | Manage users, content, settings |
| FloorCaptain | Manages specific floor | Verify residents, post announcements |
| Resident | Current building resident | View content, participate in forums |
| Alumni | Former resident | Limited view and participation rights |

### Role Assignment

Roles are assigned through the `user_roles` junction table, allowing users to have multiple roles. The schema design includes:

```sql
CREATE TABLE roles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_roles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);
```

## User Profiles

User profiles extend the core authentication data:

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
    occupation TEXT,
    move_in_date DATE,
    move_out_date DATE,
    residency_status TEXT DEFAULT 'current',
    alumni_since DATE,
    forwarding_address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    pet_information JSONB DEFAULT '[]',
    languages_spoken TEXT[],
    verification_status TEXT DEFAULT 'pending',
    verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    verification_notes TEXT,
    profile_visibility TEXT DEFAULT 'residents_only',
    social_media_links JSONB DEFAULT '{}',
    profile_completeness INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Alumni Membership

The system allows former residents to maintain accounts with alumni status:

```sql
CREATE TABLE alumni_membership_tiers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    benefits JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_memberships (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    membership_tier_id uuid REFERENCES alumni_membership_tiers(id) ON DELETE SET NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    payment_status TEXT,
    renewal_date DATE,
    approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Floor Captain System

Floor captains are assigned to specific floors to manage residents:

```sql
CREATE TABLE floor_captain_assignments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    floor_number INTEGER NOT NULL,
    assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, floor_number)
);
```

## User Preferences

User preferences allow personalization of the experience:

```sql
CREATE TABLE user_preferences (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    communication_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    notification_settings JSONB DEFAULT '{"events": true, "announcements": true, "maintenance": true, "forums": true}',
    privacy_settings JSONB DEFAULT '{"share_contact": false, "visible_in_directory": true}',
    theme_preference TEXT DEFAULT 'system',
    accessibility_settings JSONB DEFAULT '{}',
    email_digest_frequency TEXT DEFAULT 'weekly',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Row-Level Security

Row-level security policies protect user data. See [Security Policies](./policies.md) for details.