-- ================================================================
-- COMPLETE SUPABASE SCHEMA EXPORT
-- Ten Ocean Tenant Association Database
-- Export Date: January 2025
-- Source: Supabase PostgreSQL
-- Target: Neon PostgreSQL with Prisma ORM
-- ================================================================

-- ================================================================
-- TABLES CREATION
-- ================================================================

-- AI Configuration Table
CREATE TABLE "public"."ai_configuration" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "model_name" text NOT NULL,
    "temperature" numeric(3,2) NOT NULL DEFAULT 0.7,
    "max_tokens" integer,
    "system_prompt" text,
    "is_active" boolean DEFAULT true,
    "created_by" uuid NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- AI Context Sources Table
CREATE TABLE "public"."ai_context_sources" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "name" text NOT NULL,
    "description" text,
    "source_type" text NOT NULL,
    "content_path" text,
    "is_enabled" boolean DEFAULT true,
    "priority" integer NOT NULL DEFAULT 0,
    "last_updated" timestamp with time zone NOT NULL DEFAULT now(),
    "update_frequency" text NOT NULL DEFAULT 'manual'::text,
    "created_by" uuid NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Alumni Membership Tiers Table
CREATE TABLE "public"."alumni_membership_tiers" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "name" text NOT NULL,
    "description" text,
    "benefits" jsonb NOT NULL DEFAULT '[]'::jsonb,
    "is_active" boolean NOT NULL DEFAULT true,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Announcements Table
CREATE TABLE "public"."announcements" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "title" text NOT NULL,
    "content" text NOT NULL,
    "priority" text NOT NULL DEFAULT 'normal'::text,
    "is_pinned" boolean DEFAULT false,
    "created_by" uuid NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    "published_at" timestamp with time zone,
    "expires_at" timestamp with time zone
);

-- Category Subscriptions Table
CREATE TABLE "public"."category_subscriptions" (
    "user_id" uuid NOT NULL,
    "category_id" uuid NOT NULL,
    "subscription_type" text NOT NULL DEFAULT 'new_topics'::text,
    "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Chat Messages Table
CREATE TABLE "public"."chat_messages" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "session_id" uuid NOT NULL,
    "content" text NOT NULL,
    "role" text NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "referenced_documents" jsonb DEFAULT '[]'::jsonb
);

-- Chat Sessions Table
CREATE TABLE "public"."chat_sessions" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL,
    "title" text NOT NULL DEFAULT 'New Chat'::text,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    "is_archived" boolean DEFAULT false,
    "metadata" jsonb DEFAULT '{}'::jsonb
);

-- Comments Table
CREATE TABLE "public"."comments" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "content" text NOT NULL,
    "user_id" uuid NOT NULL,
    "parent_type" text NOT NULL,
    "parent_id" uuid NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Documents Table
CREATE TABLE "public"."documents" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "title" text NOT NULL,
    "description" text,
    "category" text,
    "uploaded_by" uuid NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Event Attendees Table
CREATE TABLE "public"."event_attendees" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "event_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "status" text NOT NULL DEFAULT 'going'::text,
    "registered_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Events Table
CREATE TABLE "public"."events" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "title" text NOT NULL,
    "description" text,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "location" text,
    "max_attendees" integer,
    "is_private" boolean DEFAULT false,
    "created_by" uuid NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- File Attachments Table
CREATE TABLE "public"."file_attachments" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "file_id" uuid NOT NULL,
    "attachable_type" text NOT NULL,
    "attachable_id" uuid NOT NULL,
    "description" text,
    "display_order" integer DEFAULT 0,
    "added_by" uuid NOT NULL,
    "added_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- File Categories Table
CREATE TABLE "public"."file_categories" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "name" text NOT NULL,
    "description" text,
    "color_code" text,
    "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- File Category Items Table
CREATE TABLE "public"."file_category_items" (
    "file_id" uuid NOT NULL,
    "category_id" uuid NOT NULL
);

-- Files Table
CREATE TABLE "public"."files" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "original_filename" text NOT NULL,
    "storage_path" text NOT NULL,
    "file_type" text NOT NULL,
    "mime_type" text NOT NULL,
    "file_size" integer NOT NULL,
    "uploaded_by" uuid NOT NULL,
    "uploaded_at" timestamp with time zone NOT NULL DEFAULT now(),
    "sha256_hash" text,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "status" text NOT NULL DEFAULT 'processing'::text,
    "privacy_level" text NOT NULL DEFAULT 'residents'::text
);

-- Floor Captain Assignments Table
CREATE TABLE "public"."floor_captain_assignments" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL,
    "floor_number" integer NOT NULL,
    "assigned_by" uuid,
    "assigned_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Forum Categories Table
CREATE TABLE "public"."forum_categories" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "name" text NOT NULL,
    "description" text,
    "slug" text NOT NULL,
    "icon_file_id" uuid,
    "parent_category_id" uuid,
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Forum Posts Table
CREATE TABLE "public"."forum_posts" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "topic_id" uuid NOT NULL,
    "author_id" uuid NOT NULL,
    "content" text NOT NULL,
    "is_edited" boolean DEFAULT false,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Forum Topics Table
CREATE TABLE "public"."forum_topics" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "category_id" uuid NOT NULL,
    "title" text NOT NULL,
    "slug" text NOT NULL,
    "content" text,
    "author_id" uuid NOT NULL,
    "is_pinned" boolean DEFAULT false,
    "is_locked" boolean DEFAULT false,
    "views_count" integer DEFAULT 0,
    "last_post_at" timestamp with time zone,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Maintenance Requests Table
CREATE TABLE "public"."maintenance_requests" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "title" text NOT NULL,
    "description" text NOT NULL,
    "priority" text NOT NULL DEFAULT 'medium'::text,
    "status" text NOT NULL DEFAULT 'open'::text,
    "category" text,
    "unit_id" uuid NOT NULL,
    "submitted_by" uuid NOT NULL,
    "assigned_to" uuid,
    "submitted_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    "completed_at" timestamp with time zone
);

-- Post Reactions Table
CREATE TABLE "public"."post_reactions" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "post_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "reaction_type" text NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Question Responses Table
CREATE TABLE "public"."question_responses" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "survey_response_id" uuid NOT NULL,
    "question_id" uuid NOT NULL,
    "answer" text NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Roles Table
CREATE TABLE "public"."roles" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "name" text NOT NULL,
    "description" text,
    "permissions" jsonb DEFAULT '[]'::jsonb,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Survey Questions Table
CREATE TABLE "public"."survey_questions" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "survey_id" uuid NOT NULL,
    "question_text" text NOT NULL,
    "question_type" text NOT NULL,
    "options" jsonb,
    "is_required" boolean DEFAULT false,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Survey Responses Table
CREATE TABLE "public"."survey_responses" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "survey_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "submitted_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Surveys Table
CREATE TABLE "public"."surveys" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "title" text NOT NULL,
    "description" text,
    "is_active" boolean DEFAULT true,
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "created_by" uuid NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Topic Subscriptions Table
CREATE TABLE "public"."topic_subscriptions" (
    "user_id" uuid NOT NULL,
    "topic_id" uuid NOT NULL,
    "subscription_type" text NOT NULL DEFAULT 'all_posts'::text,
    "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Units Table
CREATE TABLE "public"."units" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "unit_number" text NOT NULL,
    "floor" integer NOT NULL,
    "bedrooms" integer,
    "bathrooms" numeric(2,1),
    "square_feet" integer,
    "rent_amount" numeric(10,2),
    "is_occupied" boolean DEFAULT false,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- User Connections Table
CREATE TABLE "public"."user_connections" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL,
    "connected_user_id" uuid NOT NULL,
    "connection_type" text NOT NULL DEFAULT 'friend'::text,
    "status" text NOT NULL DEFAULT 'pending'::text,
    "initiated_by" uuid NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "accepted_at" timestamp with time zone
);

-- User Memberships Table
CREATE TABLE "public"."user_memberships" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL,
    "tier_id" uuid NOT NULL,
    "start_date" timestamp with time zone NOT NULL DEFAULT now(),
    "end_date" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "payment_status" text DEFAULT 'pending'::text,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- User Preferences Table
CREATE TABLE "public"."user_preferences" (
    "user_id" uuid NOT NULL,
    "notification_settings" jsonb DEFAULT '{}'::jsonb,
    "communication_preferences" jsonb DEFAULT '{}'::jsonb,
    "privacy_settings" jsonb DEFAULT '{}'::jsonb,
    "accessibility_settings" jsonb DEFAULT '{}'::jsonb,
    "theme_preference" text DEFAULT 'light'::text,
    "email_digest_frequency" text DEFAULT 'weekly'::text,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- User Profiles Table
CREATE TABLE "public"."user_profiles" (
    "id" uuid NOT NULL,
    "first_name" text,
    "last_name" text,
    "display_name" text,
    "bio" text,
    "avatar_file_id" uuid,
    "phone_number" text,
    "emergency_contact" jsonb,
    "unit_id" uuid,
    "residency_status" text DEFAULT 'resident'::text,
    "move_in_date" date,
    "move_out_date" date,
    "occupation" text,
    "workplace" text,
    "interests" text[],
    "skills" text[],
    "languages" text[],
    "social_media" jsonb DEFAULT '{}'::jsonb,
    "verification_status" text DEFAULT 'pending'::text,
    "verification_notes" text,
    "verified_by" uuid,
    "verified_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "privacy_level" text DEFAULT 'residents'::text,
    "last_active_at" timestamp with time zone,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- User Roles Table
CREATE TABLE "public"."user_roles" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL,
    "role_id" uuid NOT NULL,
    "assigned_by" uuid,
    "assigned_at" timestamp with time zone NOT NULL DEFAULT now(),
    "expires_at" timestamp with time zone
);

-- User Skills Table
CREATE TABLE "public"."user_skills" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL,
    "skills" text[],
    "interests" text[],
    "community_involvement" text[],
    "volunteer_availability" jsonb,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- ================================================================
-- PRIMARY KEYS AND INDEXES
-- ================================================================

-- Primary Keys
ALTER TABLE ONLY "public"."ai_configuration" ADD CONSTRAINT "ai_configuration_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."ai_context_sources" ADD CONSTRAINT "ai_context_sources_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."alumni_membership_tiers" ADD CONSTRAINT "alumni_membership_tiers_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."announcements" ADD CONSTRAINT "announcements_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."category_subscriptions" ADD CONSTRAINT "category_subscriptions_pkey" PRIMARY KEY ("user_id", "category_id");
ALTER TABLE ONLY "public"."chat_messages" ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."chat_sessions" ADD CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."comments" ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."documents" ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."event_attendees" ADD CONSTRAINT "event_attendees_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."events" ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."file_attachments" ADD CONSTRAINT "file_attachments_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."file_categories" ADD CONSTRAINT "file_categories_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."file_category_items" ADD CONSTRAINT "file_category_items_pkey" PRIMARY KEY ("file_id", "category_id");
ALTER TABLE ONLY "public"."files" ADD CONSTRAINT "files_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."floor_captain_assignments" ADD CONSTRAINT "floor_captain_assignments_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."forum_categories" ADD CONSTRAINT "forum_categories_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."forum_posts" ADD CONSTRAINT "forum_posts_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."forum_topics" ADD CONSTRAINT "forum_topics_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."maintenance_requests" ADD CONSTRAINT "maintenance_requests_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."post_reactions" ADD CONSTRAINT "post_reactions_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."question_responses" ADD CONSTRAINT "question_responses_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."roles" ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."survey_questions" ADD CONSTRAINT "survey_questions_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."survey_responses" ADD CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."surveys" ADD CONSTRAINT "surveys_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."topic_subscriptions" ADD CONSTRAINT "topic_subscriptions_pkey" PRIMARY KEY ("user_id", "topic_id");
ALTER TABLE ONLY "public"."units" ADD CONSTRAINT "units_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."user_connections" ADD CONSTRAINT "user_connections_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."user_memberships" ADD CONSTRAINT "user_memberships_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."user_preferences" ADD CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("user_id");
ALTER TABLE ONLY "public"."user_profiles" ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."user_roles" ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."user_skills" ADD CONSTRAINT "user_skills_pkey" PRIMARY KEY ("id");

-- Unique Constraints
ALTER TABLE ONLY "public"."alumni_membership_tiers" ADD CONSTRAINT "alumni_membership_tiers_name_key" UNIQUE ("name");
ALTER TABLE ONLY "public"."event_attendees" ADD CONSTRAINT "event_attendees_event_id_user_id_key" UNIQUE ("event_id", "user_id");
ALTER TABLE ONLY "public"."file_categories" ADD CONSTRAINT "file_categories_name_key" UNIQUE ("name");
ALTER TABLE ONLY "public"."floor_captain_assignments" ADD CONSTRAINT "floor_captain_assignments_user_id_floor_number_key" UNIQUE ("user_id", "floor_number");
ALTER TABLE ONLY "public"."forum_categories" ADD CONSTRAINT "forum_categories_slug_key" UNIQUE ("slug");
ALTER TABLE ONLY "public"."forum_topics" ADD CONSTRAINT "forum_topics_category_id_slug_key" UNIQUE ("category_id", "slug");
ALTER TABLE ONLY "public"."post_reactions" ADD CONSTRAINT "post_reactions_post_id_user_id_reaction_type_key" UNIQUE ("post_id", "user_id", "reaction_type");
ALTER TABLE ONLY "public"."question_responses" ADD CONSTRAINT "question_responses_survey_response_id_question_id_key" UNIQUE ("survey_response_id", "question_id");
ALTER TABLE ONLY "public"."roles" ADD CONSTRAINT "roles_name_key" UNIQUE ("name");
ALTER TABLE ONLY "public"."survey_responses" ADD CONSTRAINT "survey_responses_survey_id_user_id_key" UNIQUE ("survey_id", "user_id");
ALTER TABLE ONLY "public"."units" ADD CONSTRAINT "units_unit_number_key" UNIQUE ("unit_number");
ALTER TABLE ONLY "public"."user_connections" ADD CONSTRAINT "user_connections_user_id_connected_user_id_key" UNIQUE ("user_id", "connected_user_id");
ALTER TABLE ONLY "public"."user_roles" ADD CONSTRAINT "user_roles_user_id_role_id_key" UNIQUE ("user_id", "role_id");

-- Performance Indexes
CREATE INDEX "idx_comments_parent" ON "public"."comments" USING btree ("parent_type", "parent_id");
CREATE INDEX "idx_events_start_time" ON "public"."events" USING btree ("start_time");
CREATE INDEX "idx_file_attachments_attachable" ON "public"."file_attachments" USING btree ("attachable_type", "attachable_id");
CREATE INDEX "idx_file_attachments_file_id" ON "public"."file_attachments" USING btree ("file_id");
CREATE INDEX "idx_forum_posts_author_id" ON "public"."forum_posts" USING btree ("author_id");
CREATE INDEX "idx_forum_posts_topic_id" ON "public"."forum_posts" USING btree ("topic_id");
CREATE INDEX "idx_forum_topics_category_id" ON "public"."forum_topics" USING btree ("category_id");
CREATE INDEX "idx_maintenance_requests_status" ON "public"."maintenance_requests" USING btree ("status");
CREATE INDEX "idx_maintenance_requests_unit_id" ON "public"."maintenance_requests" USING btree ("unit_id");
CREATE INDEX "idx_survey_questions_survey_id" ON "public"."survey_questions" USING btree ("survey_id");
CREATE INDEX "idx_user_profiles_residency_status" ON "public"."user_profiles" USING btree ("residency_status");
CREATE INDEX "idx_user_profiles_unit_id" ON "public"."user_profiles" USING btree ("unit_id");
CREATE INDEX "idx_user_profiles_verification_status" ON "public"."user_profiles" USING btree ("verification_status");

-- ================================================================
-- CUSTOM FUNCTIONS
-- ================================================================

-- Update Timestamp Function
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Update Forum Topic Last Post Time Function
CREATE OR REPLACE FUNCTION public.update_forum_topic_last_post_time()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE forum_topics 
    SET last_post_at = NEW.created_at 
    WHERE id = NEW.topic_id;
    RETURN NEW;
END;
$$;

-- ================================================================
-- TRIGGERS
-- ================================================================

-- Update Timestamp Triggers
CREATE TRIGGER "update_user_profile_timestamp" 
    BEFORE UPDATE ON "public"."user_profiles" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_timestamp();

-- Forum Topic Last Post Update Trigger
CREATE TRIGGER "update_topic_timestamp" 
    AFTER INSERT ON "public"."forum_posts" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_forum_topic_last_post_time();

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

-- Enable RLS on sensitive tables
ALTER TABLE "public"."announcements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."chat_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."chat_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."files" ENABLE ROW LEVEL SECURITY;

-- User Profile RLS Policies
CREATE POLICY "Admins can view all profiles"
ON "public"."user_profiles"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING ((EXISTS ( SELECT 1
   FROM (user_roles
     JOIN roles ON ((user_roles.role_id = roles.id)))
  WHERE ((user_roles.user_id = auth.uid()) AND (roles.name = 'Admin'::text)))));

CREATE POLICY "Floor captains can view profiles on their floors"
ON "public"."user_profiles"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (((EXISTS ( SELECT 1
   FROM (user_roles
     JOIN roles ON ((user_roles.role_id = roles.id)))
  WHERE ((user_roles.user_id = auth.uid()) AND (roles.name = 'FloorCaptain'::text)))) AND (EXISTS ( SELECT 1
   FROM (floor_captain_assignments fca
     JOIN units u ON ((fca.floor_number = u.floor)))
  WHERE ((fca.user_id = auth.uid()) AND (user_profiles.unit_id = u.id))))));

CREATE POLICY "Users can view their own profile"
ON "public"."user_profiles"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING ((auth.uid() = id));

CREATE POLICY "Verified users can view other residents' profiles"
ON "public"."user_profiles"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (((EXISTS ( SELECT 1
   FROM user_profiles user_profiles_1
  WHERE ((user_profiles_1.id = auth.uid()) AND (user_profiles_1.verification_status = 'approved'::text)))) AND (verification_status = 'approved'::text)));

-- ================================================================
-- FOREIGN KEY RELATIONSHIPS
-- ================================================================

-- [Note: Foreign key constraints would be defined here based on the relationships]
-- These will be implemented in the Prisma schema conversion

-- ================================================================
-- DATA MIGRATION CONSIDERATIONS
-- ================================================================

-- UUID Extension (required for uuid_generate_v4())
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Authentication Integration Notes:
-- - user_profiles.id references auth.users.id (Supabase Auth)
-- - RLS policies use auth.uid() function
-- - Migration will need to preserve user authentication mappings

-- ================================================================
-- END OF SCHEMA EXPORT
-- ================================================================ 