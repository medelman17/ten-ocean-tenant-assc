-- TENANT ASSOCIATION SCHEMA
-- This schema defines the database structure for the 10 Ocean Tenant Association application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ROLES AND PERMISSIONS
CREATE TABLE roles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initial roles
INSERT INTO roles (name, description, permissions) VALUES
('Admin', 'Full system access', '{"can_manage_users": true, "can_manage_roles": true, "can_manage_content": true}'),
('FloorCaptain', 'Manages specific floor', '{"can_verify_residents": true, "can_post_announcements": true}'),
('Resident', 'Current building resident', '{"can_view_content": true, "can_participate": true}'),
('Alumni', 'Former resident', '{"can_view_limited_content": true, "can_participate_limited": true}');

-- UNITS/APARTMENTS
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

-- USER PROFILES (extending auth.users)
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
    residency_status TEXT DEFAULT 'current' CHECK (residency_status IN ('current', 'alumni', 'inactive')),
    alumni_since DATE,
    forwarding_address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    pet_information JSONB DEFAULT '[]',
    languages_spoken TEXT[],
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    verification_notes TEXT,
    profile_visibility TEXT DEFAULT 'residents_only' CHECK (profile_visibility IN ('public', 'residents_only', 'private')),
    social_media_links JSONB DEFAULT '{}',
    profile_completeness INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- USER PREFERENCES
CREATE TABLE user_preferences (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    communication_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    notification_settings JSONB DEFAULT '{"events": true, "announcements": true, "maintenance": true, "forums": true}',
    privacy_settings JSONB DEFAULT '{"share_contact": false, "visible_in_directory": true}',
    theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
    accessibility_settings JSONB DEFAULT '{}',
    email_digest_frequency TEXT DEFAULT 'weekly' CHECK (email_digest_frequency IN ('daily', 'weekly', 'none')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- USER SKILLS & INTERESTS
CREATE TABLE user_skills (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skills TEXT[],
    interests TEXT[],
    community_involvement TEXT[],
    volunteer_availability JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- USER_ROLES JUNCTION
CREATE TABLE user_roles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

-- FLOOR CAPTAIN ASSIGNMENTS
CREATE TABLE floor_captain_assignments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    floor_number INTEGER NOT NULL,
    assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, floor_number)
);

-- ALUMNI MEMBERSHIP TIERS
CREATE TABLE alumni_membership_tiers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    benefits JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- USER MEMBERSHIPS
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

-- USER CONNECTIONS
CREATE TABLE user_connections (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    connected_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    established_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT different_users CHECK (user_id <> connected_user_id),
    UNIQUE(user_id, connected_user_id)
);

-- FILES/MEDIA MANAGEMENT
CREATE TABLE files (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('image', 'pdf', 'document', 'video', 'audio', 'other')),
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sha256_hash TEXT,
    metadata JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'available', 'quarantined', 'deleted')),
    privacy_level TEXT NOT NULL DEFAULT 'residents' CHECK (privacy_level IN ('private', 'residents', 'admins', 'public'))
);

-- FILE CATEGORIES
CREATE TABLE file_categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FILE CATEGORIES JUNCTION
CREATE TABLE file_category_items (
    file_id uuid NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    category_id uuid NOT NULL REFERENCES file_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (file_id, category_id)
);

-- FILE ATTACHMENTS
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

-- EVENTS
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_timespan CHECK (end_time > start_time)
);

-- EVENT ATTENDEES
CREATE TABLE event_attendees (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- MAINTENANCE REQUESTS
CREATE TABLE maintenance_requests (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    unit_id uuid REFERENCES units(id) ON DELETE SET NULL,
    reported_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ANNOUNCEMENTS
CREATE TABLE announcements (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_pinned BOOLEAN DEFAULT FALSE,
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- DOCUMENTS
CREATE TABLE documents (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- COMMENTS (polymorphic)
CREATE TABLE comments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    parent_type TEXT NOT NULL,
    parent_id uuid NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SURVEYS
CREATE TABLE surveys (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    published BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'archived'))
);

-- SURVEY QUESTIONS
CREATE TABLE survey_questions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('text', 'multiple_choice', 'single_choice', 'rating', 'boolean')),
    required BOOLEAN DEFAULT FALSE,
    order_position INTEGER NOT NULL DEFAULT 0,
    options JSONB DEFAULT NULL
);

-- SURVEY RESPONSES
CREATE TABLE survey_responses (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(survey_id, user_id)
);

-- QUESTION RESPONSES
CREATE TABLE question_responses (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_response_id uuid NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
    question_id uuid NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
    answer_text TEXT,
    selected_options JSONB DEFAULT NULL,
    UNIQUE(survey_response_id, question_id)
);

-- FORUM CATEGORIES
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

-- FORUM TOPICS
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
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
    UNIQUE(category_id, slug)
);

-- FORUM POSTS
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

-- TOPIC SUBSCRIPTIONS
CREATE TABLE topic_subscriptions (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id uuid NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
    subscription_type TEXT NOT NULL DEFAULT 'all_posts' CHECK (subscription_type IN ('all_posts', 'mentions', 'none')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, topic_id)
);

-- CATEGORY SUBSCRIPTIONS
CREATE TABLE category_subscriptions (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id uuid NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
    subscription_type TEXT NOT NULL DEFAULT 'new_topics' CHECK (subscription_type IN ('all_topics', 'new_topics', 'none')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, category_id)
);

-- POST REACTIONS
CREATE TABLE post_reactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'helpful', 'agree', 'disagree', 'thanks', 'insightful')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(post_id, user_id, reaction_type)
);

-- AI CHAT ASSISTANT
CREATE TABLE chat_sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_archived BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'
);

-- CHAT MESSAGES
CREATE TABLE chat_messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    referenced_documents JSONB DEFAULT '[]'
);

-- AI CONTEXT SOURCES
CREATE TABLE ai_context_sources (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    source_type TEXT NOT NULL CHECK (source_type IN ('document', 'database', 'api', 'static')),
    content_path TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    priority INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    update_frequency TEXT NOT NULL DEFAULT 'manual' CHECK (update_frequency IN ('realtime', 'daily', 'weekly', 'manual')),
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI CONFIGURATION
CREATE TABLE ai_configuration (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name TEXT NOT NULL,
    temperature NUMERIC(3,2) NOT NULL DEFAULT 0.7,
    max_tokens INTEGER,
    system_prompt TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_unit_id ON user_profiles(unit_id);
CREATE INDEX idx_user_profiles_verification_status ON user_profiles(verification_status);
CREATE INDEX idx_user_profiles_residency_status ON user_profiles(residency_status);
CREATE INDEX idx_maintenance_requests_unit_id ON maintenance_requests(unit_id);
CREATE INDEX idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_forum_topics_category_id ON forum_topics(category_id);
CREATE INDEX idx_forum_posts_topic_id ON forum_posts(topic_id);
CREATE INDEX idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX idx_file_attachments_file_id ON file_attachments(file_id);
CREATE INDEX idx_file_attachments_attachable ON file_attachments(attachable_type, attachable_id);
CREATE INDEX idx_comments_parent ON comments(parent_type, parent_id);
CREATE INDEX idx_survey_questions_survey_id ON survey_questions(survey_id);

-- Row Level Security Policies (RLS)
-- These would be expanded in a full implementation

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Add example policies (these would need to be expanded)
CREATE POLICY "Users can see their own profiles" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can see their own maintenance requests" 
ON maintenance_requests FOR SELECT 
USING (auth.uid() = reported_by);

CREATE POLICY "Users can see their own chat messages" 
ON chat_messages FOR SELECT 
USING (
  session_id IN (
    SELECT id FROM chat_sessions WHERE user_id = auth.uid()
  )
);

-- Functions and Triggers
-- Example of a function to update the last_post_at timestamp on forum topics
CREATE OR REPLACE FUNCTION update_forum_topic_last_post_time()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_topics 
  SET last_post_at = NEW.created_at
  WHERE id = NEW.topic_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_topic_timestamp
AFTER INSERT ON forum_posts
FOR EACH ROW
EXECUTE FUNCTION update_forum_topic_last_post_time();

-- Function to update user_profiles.updated_at when changed
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profile_timestamp
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();