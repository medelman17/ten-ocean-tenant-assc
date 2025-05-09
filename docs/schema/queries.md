# Common Database Queries

This document provides examples of common database queries used in the 10 Ocean Tenant Association application. These queries demonstrate how to effectively work with the schema.

## User Management Queries

### Get User Profile with Roles

```typescript
const getUserWithRoles = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      units!inner (
        unit_number,
        floor
      ),
      user_roles (
        roles (
          name,
          permissions
        )
      )
    `)
    .eq('id', userId)
    .single();
    
  return { data, error };
};
```

### Check if User Has Role

```typescript
const userHasRole = async (userId: string, roleName: string) => {
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      roles!inner (
        name
      )
    `)
    .eq('user_id', userId)
    .eq('roles.name', roleName);
    
  return { hasRole: data && data.length > 0, error };
};
```

### Get Pending User Verifications for Floor Captain

```typescript
const getPendingVerifications = async (floorCaptainId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      units!inner (
        unit_number,
        floor
      )
    `)
    .eq('verification_status', 'pending')
    .in('units.floor', (
      supabase
        .from('floor_captain_assignments')
        .select('floor_number')
        .eq('user_id', floorCaptainId)
    ));
    
  return { data, error };
};
```

## Unit/Apartment Queries

### Get All Units with Current Residents

```typescript
const getUnitsWithResidents = async () => {
  const { data, error } = await supabase
    .from('units')
    .select(`
      *,
      user_profiles (
        id,
        first_name,
        last_name,
        display_name,
        residency_status
      )
    `)
    .order('floor', { ascending: true })
    .order('unit_number', { ascending: true });
    
  return { data, error };
};
```

### Find Available Units

```typescript
const getAvailableUnits = async () => {
  const { data, error } = await supabase
    .from('units')
    .select(`
      *,
      user_profiles!left (
        id
      )
    `)
    .is('user_profiles.id', null);
    
  return { data, error };
};
```

## Maintenance Request Queries

### Get Open Maintenance Requests for a Unit

```typescript
const getUnitMaintenanceRequests = async (unitId: string) => {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(`
      *,
      reported_by:user_profiles!reported_by_fkey (
        first_name,
        last_name,
        display_name
      ),
      assigned_to:user_profiles!assigned_to_fkey (
        first_name,
        last_name,
        display_name
      ),
      units (
        unit_number,
        floor
      )
    `)
    .eq('unit_id', unitId)
    .in('status', ['open', 'in_progress', 'waiting'])
    .order('created_at', { ascending: false });
    
  return { data, error };
};
```

### Get Maintenance Requests by Status

```typescript
const getMaintenanceRequestsByStatus = async (status: string) => {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(`
      *,
      reported_by:user_profiles!reported_by_fkey (
        first_name,
        last_name,
        display_name
      ),
      units (
        unit_number,
        floor
      )
    `)
    .eq('status', status)
    .order('created_at', { ascending: false });
    
  return { data, error };
};
```

## Event Queries

### Get Upcoming Events

```typescript
const getUpcomingEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      created_by:user_profiles!created_by_fkey (
        first_name,
        last_name,
        display_name
      ),
      event_attendees (
        count
      )
    `)
    .gt('start_time', new Date().toISOString())
    .eq('is_private', false)
    .order('start_time', { ascending: true });
    
  return { data, error };
};
```

### Get User's Event Attendance

```typescript
const getUserEventAttendance = async (userId: string) => {
  const { data, error } = await supabase
    .from('event_attendees')
    .select(`
      status,
      events (
        id,
        title,
        start_time,
        end_time,
        location
      )
    `)
    .eq('user_id', userId)
    .gt('events.start_time', new Date().toISOString())
    .order('events.start_time', { ascending: true });
    
  return { data, error };
};
```

## Forum Queries

### Get Forum Categories with Topic Counts

```typescript
const getForumCategories = async () => {
  const { data, error } = await supabase
    .from('forum_categories')
    .select(`
      *,
      parent_category:forum_categories!parent_category_id_fkey (
        name
      ),
      roles (
        name
      ),
      topics:forum_topics (
        count
      )
    `)
    .is('parent_category_id', null)
    .order('display_order', { ascending: true });
    
  return { data, error };
};
```

### Get Topics in a Category

```typescript
const getCategoryTopics = async (categorySlug: string) => {
  const { data, error } = await supabase
    .from('forum_topics')
    .select(`
      *,
      author:user_profiles!author_id_fkey (
        first_name,
        last_name,
        display_name
      ),
      categories:forum_categories!inner (
        name,
        slug
      ),
      posts:forum_posts (
        count
      )
    `)
    .eq('categories.slug', categorySlug)
    .order('is_pinned', { ascending: false })
    .order('last_post_at', { ascending: false });
    
  return { data, error };
};
```

### Get Topic with Posts

```typescript
const getTopicWithPosts = async (categorySlug: string, topicSlug: string) => {
  // First, get the topic
  const { data: topic, error: topicError } = await supabase
    .from('forum_topics')
    .select(`
      *,
      author:user_profiles!author_id_fkey (
        first_name,
        last_name,
        display_name
      ),
      categories:forum_categories!inner (
        name,
        slug
      )
    `)
    .eq('categories.slug', categorySlug)
    .eq('slug', topicSlug)
    .single();
    
  if (topicError || !topic) {
    return { data: null, error: topicError };
  }
  
  // Then get all posts
  const { data: posts, error: postsError } = await supabase
    .from('forum_posts')
    .select(`
      *,
      author:user_profiles!author_id_fkey (
        first_name,
        last_name,
        display_name,
        profile_picture_url
      ),
      parent_post:forum_posts!parent_post_id_fkey (
        id
      ),
      reactions:post_reactions (
        reaction_type,
        count
      )
    `)
    .eq('topic_id', topic.id)
    .order('created_at', { ascending: true });
    
  return { 
    data: { 
      topic, 
      posts 
    }, 
    error: postsError 
  };
};
```

## Survey Queries

### Get Active Surveys

```typescript
const getActiveSurveys = async () => {
  const { data, error } = await supabase
    .from('surveys')
    .select(`
      *,
      created_by:user_profiles!created_by_fkey (
        first_name,
        last_name,
        display_name
      ),
      responses:survey_responses (
        count
      )
    `)
    .eq('status', 'active')
    .eq('published', true)
    .or('expires_at.gt.now,expires_at.is.null')
    .order('created_at', { ascending: false });
    
  return { data, error };
};
```

### Get Survey with Questions

```typescript
const getSurveyWithQuestions = async (surveyId: string) => {
  const { data, error } = await supabase
    .from('surveys')
    .select(`
      *,
      created_by:user_profiles!created_by_fkey (
        first_name,
        last_name,
        display_name
      ),
      questions:survey_questions (
        id,
        question_text,
        question_type,
        required,
        order_position,
        options
      )
    `)
    .eq('id', surveyId)
    .single();
    
  return { data, error };
};
```

### Get Survey Results

```typescript
const getSurveyResults = async (surveyId: string) => {
  const { data: survey, error: surveyError } = await supabase
    .from('surveys')
    .select(`
      *,
      created_by:user_profiles!created_by_fkey (
        first_name,
        last_name,
        display_name
      ),
      questions:survey_questions (
        id,
        question_text,
        question_type,
        options
      )
    `)
    .eq('id', surveyId)
    .single();
    
  if (surveyError || !survey) {
    return { data: null, error: surveyError };
  }
  
  const { data: responses, error: responsesError } = await supabase
    .from('survey_responses')
    .select(`
      *,
      user:user_profiles!user_id_fkey (
        first_name,
        last_name,
        display_name
      ),
      answers:question_responses (
        question_id,
        answer_text,
        selected_options
      )
    `)
    .eq('survey_id', surveyId);
    
  return { 
    data: { 
      survey, 
      responses 
    }, 
    error: responsesError 
  };
};
```

## File Management Queries

### Get Files by Category

```typescript
const getFilesByCategory = async (categoryId: string) => {
  const { data, error } = await supabase
    .from('file_category_items')
    .select(`
      files!inner (
        *,
        uploaded_by:user_profiles!uploaded_by_fkey (
          first_name,
          last_name,
          display_name
        )
      )
    `)
    .eq('category_id', categoryId);
    
  return { data: data?.map(item => item.files), error };
};
```

### Get Files Attached to Entity

```typescript
const getAttachedFiles = async (attachableType: string, attachableId: string) => {
  const { data, error } = await supabase
    .from('file_attachments')
    .select(`
      *,
      files!inner (
        *,
        uploaded_by:user_profiles!uploaded_by_fkey (
          first_name,
          last_name,
          display_name
        )
      )
    `)
    .eq('attachable_type', attachableType)
    .eq('attachable_id', attachableId)
    .order('display_order', { ascending: true });
    
  return { data: data?.map(item => ({ ...item.files, attachment: item })), error };
};
```

## AI Chat Queries

### Get User Chat Sessions

```typescript
const getUserChatSessions = async (userId: string) => {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select(`
      *,
      messages:chat_messages (
        count
      )
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
    
  return { data, error };
};
```

### Get Chat Session Messages

```typescript
const getChatSessionMessages = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
    
  return { data, error };
};
```

## Advanced Query Techniques

### Full-Text Search for Forum Posts

```typescript
const searchForumPosts = async (searchQuery: string) => {
  const { data, error } = await supabase
    .from('forum_posts')
    .select(`
      *,
      topic:forum_topics!inner (
        title,
        slug
      ),
      category:forum_topics!inner (
        forum_categories!inner (
          name,
          slug
        )
      ),
      author:user_profiles!author_id_fkey (
        first_name,
        last_name,
        display_name
      )
    `)
    .textSearch('content', searchQuery);
    
  return { data, error };
};
```

### Paginated Results with Cursor

```typescript
const getMaintenanceRequestsPaginated = async (pageSize: number, cursor?: string) => {
  let query = supabase
    .from('maintenance_requests')
    .select(`
      *,
      reported_by:user_profiles!reported_by_fkey (
        first_name,
        last_name,
        display_name
      ),
      units (
        unit_number,
        floor
      )
    `)
    .order('created_at', { ascending: false })
    .limit(pageSize);
    
  // If cursor provided, start after that record
  if (cursor) {
    const [createdAt, id] = cursor.split('_');
    query = query
      .or(`created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.gt.${id})`);
  }
  
  const { data, error } = await query;
  
  // Create cursor for next page
  const nextCursor = data && data.length === pageSize 
    ? `${data[data.length - 1].created_at}_${data[data.length - 1].id}`
    : null;
    
  return { data, nextCursor, error };
};
```

### Aggregating Data for Reports

```typescript
const getMaintenanceStatsByMonth = async (year: number) => {
  const { data, error } = await supabase.rpc('get_maintenance_stats_by_month', {
    year_input: year
  });
  
  return { data, error };
};
```

```sql
-- Corresponding stored procedure
CREATE OR REPLACE FUNCTION get_maintenance_stats_by_month(year_input integer)
RETURNS TABLE (
  month integer,
  month_name text,
  total integer,
  open integer,
  in_progress integer,
  resolved integer,
  avg_resolution_days numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXTRACT(MONTH FROM created_at)::integer AS month,
    to_char(created_at, 'Month') AS month_name,
    COUNT(id) AS total,
    SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open,
    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
    SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved,
    AVG(CASE 
      WHEN status = 'resolved' AND resolved_at IS NOT NULL 
      THEN EXTRACT(EPOCH FROM resolved_at - created_at)/86400 
      ELSE NULL 
    END) AS avg_resolution_days
  FROM
    maintenance_requests
  WHERE
    EXTRACT(YEAR FROM created_at) = year_input
  GROUP BY
    month, month_name
  ORDER BY
    month;
END;
$$ LANGUAGE plpgsql;