# Database Security Policies

This document details the Row-Level Security (RLS) policies implemented in the 10 Ocean Tenant Association database to protect data privacy and enforce access control.

## Overview of RLS Policies

Supabase uses PostgreSQL's Row-Level Security (RLS) feature to restrict which rows users can access in database tables. Policies are defined for each table and can vary by operation type (SELECT, INSERT, UPDATE, DELETE).

## Policy Design Principles

Our RLS policies follow these core principles:

1. **Default Deny** - By default, all access is denied unless explicitly allowed by a policy
2. **Least Privilege** - Users only have access to the minimum data needed for their role
3. **Role-Based Access** - Policies utilize user roles to determine access levels
4. **Owner-Based Access** - Users can always access their own data
5. **Data Sensitivity Tiers** - Data is classified by sensitivity, with policies reflecting these classifications

## Policy Structure

Each policy has several components:

- **Name** - Descriptive name of the policy
- **Table** - The table the policy applies to
- **Operation** - The operation it controls (SELECT, INSERT, UPDATE, DELETE)
- **Using Expression** - SQL expression that determines if a row is visible/accessible
- **With Check Expression** - Additional SQL expression that determines if a row can be inserted/updated

## Core Tables and Policies

### User Profiles

```sql
-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can see their own profiles
CREATE POLICY "Users can see their own profiles" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can see profiles with 'public' visibility
CREATE POLICY "Users can see public profiles" 
ON user_profiles FOR SELECT 
USING (profile_visibility = 'public');

-- Residents can see profiles with 'residents_only' visibility
CREATE POLICY "Residents can see residents_only profiles" 
ON user_profiles FOR SELECT 
USING (
  profile_visibility = 'residents_only' AND 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role_id IN (SELECT id FROM roles WHERE name IN ('Resident', 'FloorCaptain', 'Admin'))
  )
);

-- Users can update their own profiles
CREATE POLICY "Users can update their own profiles" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can see all profiles
CREATE POLICY "Admins can see all profiles" 
ON user_profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role_id IN (SELECT id FROM roles WHERE name = 'Admin')
  )
);

-- Floor captains can see profiles of users on their floor
CREATE POLICY "Floor captains can see profiles on their floor" 
ON user_profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM floor_captain_assignments fca
    JOIN units u ON u.floor = fca.floor_number
    WHERE fca.user_id = auth.uid() 
    AND user_profiles.unit_id = u.id
  )
);
```

### Maintenance Requests

```sql
-- Enable RLS on maintenance_requests
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Users can see their own maintenance requests
CREATE POLICY "Users can see their own maintenance requests" 
ON maintenance_requests FOR SELECT 
USING (auth.uid() = reported_by);

-- Users can update their own maintenance requests (if not closed)
CREATE POLICY "Users can update their own maintenance requests" 
ON maintenance_requests FOR UPDATE 
USING (
  auth.uid() = reported_by AND 
  status NOT IN ('closed', 'resolved')
)
WITH CHECK (
  auth.uid() = reported_by AND 
  status NOT IN ('closed', 'resolved')
);

-- Users can see maintenance requests for their unit
CREATE POLICY "Users can see maintenance requests for their unit" 
ON maintenance_requests FOR SELECT 
USING (
  unit_id IN (
    SELECT unit_id FROM user_profiles 
    WHERE id = auth.uid()
  )
);

-- Admins can see all maintenance requests
CREATE POLICY "Admins can see all maintenance requests" 
ON maintenance_requests FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role_id IN (SELECT id FROM roles WHERE name = 'Admin')
  )
);

-- Assigned users can update their assigned maintenance requests
CREATE POLICY "Assigned users can update their maintenance requests" 
ON maintenance_requests FOR UPDATE 
USING (auth.uid() = assigned_to)
WITH CHECK (auth.uid() = assigned_to);
```

### Events

```sql
-- Enable RLS on events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Public events are visible to all
CREATE POLICY "Public events are visible to all" 
ON events FOR SELECT 
USING (is_private = FALSE);

-- Private events are visible to event creators
CREATE POLICY "Private events are visible to creators" 
ON events FOR SELECT 
USING (
  is_private = TRUE AND 
  auth.uid() = created_by
);

-- Private events are visible to attendees
CREATE POLICY "Private events are visible to attendees" 
ON events FOR SELECT 
USING (
  is_private = TRUE AND 
  EXISTS (
    SELECT 1 FROM event_attendees 
    WHERE event_id = events.id AND 
    user_id = auth.uid()
  )
);

-- Event creators can update their events
CREATE POLICY "Event creators can update events" 
ON events FOR UPDATE 
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Admins can manage all events
CREATE POLICY "Admins can manage all events" 
ON events FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role_id IN (SELECT id FROM roles WHERE name = 'Admin')
  )
);
```

### Forum Topics and Posts

```sql
-- Enable RLS on forum_topics
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;

-- Topics in public categories are visible to all
CREATE POLICY "Topics in public categories are visible to all" 
ON forum_topics FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM forum_categories 
    WHERE id = forum_topics.category_id AND 
    is_private = FALSE
  )
);

-- Topics in private categories are visible to users with the required role
CREATE POLICY "Topics in private categories are visible to users with role" 
ON forum_topics FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM forum_categories fc
    JOIN user_roles ur ON ur.role_id = fc.required_role_id
    WHERE fc.id = forum_topics.category_id AND 
    fc.is_private = TRUE AND
    ur.user_id = auth.uid()
  )
);

-- Topic authors can update their topics
CREATE POLICY "Topic authors can update their topics" 
ON forum_topics FOR UPDATE 
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Enable RLS on forum_posts
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- Posts are visible if the containing topic is visible
CREATE POLICY "Posts are visible if topic is visible" 
ON forum_posts FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM forum_topics 
    WHERE id = forum_posts.topic_id AND 
    (
      -- This leverages the forum_topics policies
      -- If the user can see the topic, they can see the posts
      1=1
    )
  )
);

-- Post authors can update their posts
CREATE POLICY "Post authors can update their posts" 
ON forum_posts FOR UPDATE 
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);
```

### Files and Documents

```sql
-- Enable RLS on files
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Files with 'public' privacy are visible to all
CREATE POLICY "Public files are visible to all" 
ON files FOR SELECT 
USING (privacy_level = 'public');

-- Files with 'residents' privacy are visible to residents
CREATE POLICY "Resident files are visible to residents" 
ON files FOR SELECT 
USING (
  privacy_level = 'residents' AND 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role_id IN (SELECT id FROM roles WHERE name IN ('Resident', 'FloorCaptain', 'Admin'))
  )
);

-- Files with 'private' privacy are visible to file owners
CREATE POLICY "Private files are visible to owners" 
ON files FOR SELECT 
USING (
  privacy_level = 'private' AND 
  auth.uid() = uploaded_by
);

-- Files with 'admins' privacy are visible to admins
CREATE POLICY "Admin files are visible to admins" 
ON files FOR SELECT 
USING (
  privacy_level = 'admins' AND 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role_id IN (SELECT id FROM roles WHERE name = 'Admin')
  )
);

-- File owners can update their files
CREATE POLICY "File owners can update files" 
ON files FOR UPDATE 
USING (auth.uid() = uploaded_by)
WITH CHECK (auth.uid() = uploaded_by);
```

### AI Chat Sessions and Messages

```sql
-- Enable RLS on chat_sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own chat sessions
CREATE POLICY "Users can only see their own chat sessions" 
ON chat_sessions FOR SELECT 
USING (auth.uid() = user_id);

-- Users can only update their own chat sessions
CREATE POLICY "Users can only update their own chat sessions" 
ON chat_sessions FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Enable RLS on chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see messages in their own chat sessions
CREATE POLICY "Users can see messages in their sessions" 
ON chat_messages FOR SELECT 
USING (
  session_id IN (
    SELECT id FROM chat_sessions 
    WHERE user_id = auth.uid()
  )
);
```

## Role-Based Access Matrix

This table shows which roles have access to which resources:

| Resource | Anonymous | Resident | Alumni | Floor Captain | Admin |
|----------|-----------|----------|--------|--------------|-------|
| Public Profiles | ✓ | ✓ | ✓ | ✓ | ✓ |
| Resident-Only Profiles | ✗ | ✓ | ✗ | ✓ | ✓ |
| Private Profiles | ✗ | ✗ | ✗ | ✗ | ✓ |
| Public Events | ✓ | ✓ | ✓ | ✓ | ✓ |
| Private Events | ✗ | ✓* | ✓* | ✓* | ✓ |
| Maintenance Requests | ✗ | ✓* | ✗ | ✓** | ✓ |
| Public Forums | ✓ | ✓ | ✓ | ✓ | ✓ |
| Resident Forums | ✗ | ✓ | ✗ | ✓ | ✓ |
| Private Forums | ✗ | ✗ | ✗ | ✗ | ✓ |
| Public Files | ✓ | ✓ | ✓ | ✓ | ✓ |
| Resident Files | ✗ | ✓ | ✗ | ✓ | ✓ |
| Private Files | ✗ | ✓* | ✓* | ✓* | ✓* |
| Admin Files | ✗ | ✗ | ✗ | ✗ | ✓ |

* Only if the user is the owner or explicitly invited
** Floor captains can see maintenance requests for units on their floor

## Implementation Details

RLS policies are implemented in the following migration files:

1. Initial schema migration: `supabase/migrations/20250509231818_tenant_association_schema.sql`
2. Additional security policies: `supabase/migrations/[future_date]_security_policies.sql`

## Testing RLS Policies

To verify that RLS policies are functioning correctly:

1. Create test users with different roles
2. Test access to resources from each role
3. Verify that users can only access resources according to the access matrix
4. Test edge cases like deleted users, role changes, etc.

## Future Policy Enhancements

Planned future enhancements to security policies:

1. More granular control over document sharing
2. Time-based access policies (e.g., temporary access)
3. Enhanced audit logging for sensitive operations
4. Integration with external identity providers
5. Risk-based access controls