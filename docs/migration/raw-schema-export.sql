create table "public"."ai_configuration" (
    "id" uuid not null default uuid_generate_v4(),
    "model_name" text not null,
    "temperature" numeric(3,2) not null default 0.7,
    "max_tokens" integer,
    "system_prompt" text,
    "is_active" boolean default true,
    "created_by" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."ai_context_sources" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "source_type" text not null,
    "content_path" text,
    "is_enabled" boolean default true,
    "priority" integer not null default 0,
    "last_updated" timestamp with time zone not null default now(),
    "update_frequency" text not null default 'manual'::text,
    "created_by" uuid not null,
    "created_at" timestamp with time zone not null default now()
);


create table "public"."alumni_membership_tiers" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "benefits" jsonb not null default '[]'::jsonb,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."announcements" (
    "id" uuid not null default uuid_generate_v4(),
    "title" text not null,
    "content" text not null,
    "priority" text not null default 'normal'::text,
    "is_pinned" boolean default false,
    "created_by" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "published_at" timestamp with time zone,
    "expires_at" timestamp with time zone
);


alter table "public"."announcements" enable row level security;

create table "public"."category_subscriptions" (
    "user_id" uuid not null,
    "category_id" uuid not null,
    "subscription_type" text not null default 'new_topics'::text,
    "created_at" timestamp with time zone not null default now()
);


create table "public"."chat_messages" (
    "id" uuid not null default uuid_generate_v4(),
    "session_id" uuid not null,
    "content" text not null,
    "role" text not null,
    "created_at" timestamp with time zone not null default now(),
    "metadata" jsonb default '{}'::jsonb,
    "referenced_documents" jsonb default '[]'::jsonb
);


alter table "public"."chat_messages" enable row level security;

create table "public"."chat_sessions" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "title" text not null default 'New Chat'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "is_archived" boolean default false,
    "metadata" jsonb default '{}'::jsonb
);


alter table "public"."chat_sessions" enable row level security;

create table "public"."comments" (
    "id" uuid not null default uuid_generate_v4(),
    "content" text not null,
    "user_id" uuid not null,
    "parent_type" text not null,
    "parent_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."documents" (
    "id" uuid not null default uuid_generate_v4(),
    "title" text not null,
    "description" text,
    "category" text,
    "uploaded_by" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."documents" enable row level security;

create table "public"."event_attendees" (
    "id" uuid not null default uuid_generate_v4(),
    "event_id" uuid not null,
    "user_id" uuid not null,
    "status" text not null default 'going'::text,
    "registered_at" timestamp with time zone not null default now()
);


create table "public"."events" (
    "id" uuid not null default uuid_generate_v4(),
    "title" text not null,
    "description" text,
    "start_time" timestamp with time zone not null,
    "end_time" timestamp with time zone not null,
    "location" text,
    "max_attendees" integer,
    "is_private" boolean default false,
    "created_by" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."events" enable row level security;

create table "public"."file_attachments" (
    "id" uuid not null default uuid_generate_v4(),
    "file_id" uuid not null,
    "attachable_type" text not null,
    "attachable_id" uuid not null,
    "description" text,
    "display_order" integer default 0,
    "added_by" uuid not null,
    "added_at" timestamp with time zone not null default now()
);


create table "public"."file_categories" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "color_code" text,
    "created_at" timestamp with time zone not null default now()
);


create table "public"."file_category_items" (
    "file_id" uuid not null,
    "category_id" uuid not null
);


create table "public"."files" (
    "id" uuid not null default uuid_generate_v4(),
    "original_filename" text not null,
    "storage_path" text not null,
    "file_type" text not null,
    "mime_type" text not null,
    "file_size" integer not null,
    "uploaded_by" uuid not null,
    "uploaded_at" timestamp with time zone not null default now(),
    "sha256_hash" text,
    "metadata" jsonb default '{}'::jsonb,
    "status" text not null default 'processing'::text,
    "privacy_level" text not null default 'residents'::text
);


alter table "public"."files" enable row level security;

create table "public"."floor_captain_assignments" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "floor_number" integer not null,
    "assigned_by" uuid,
    "assigned_at" timestamp with time zone not null default now()
);


create table "public"."forum_categories" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "slug" text not null,
    "icon_file_id" uuid,
    "parent_category_id" uuid,
    "display_order" integer not null default 0,
    "created_by" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "is_private" boolean default false,
    "required_role_id" uuid
);


create table "public"."forum_posts" (
    "id" uuid not null default uuid_generate_v4(),
    "topic_id" uuid not null,
    "author_id" uuid not null,
    "content" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "is_edited" boolean default false,
    "is_anonymous" boolean default false,
    "is_solution" boolean default false,
    "parent_post_id" uuid
);


alter table "public"."forum_posts" enable row level security;

create table "public"."forum_topics" (
    "id" uuid not null default uuid_generate_v4(),
    "title" text not null,
    "category_id" uuid not null,
    "author_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "last_post_at" timestamp with time zone not null default now(),
    "is_pinned" boolean default false,
    "is_locked" boolean default false,
    "view_count" integer not null default 0,
    "slug" text not null,
    "is_anonymous" boolean default false,
    "status" text not null default 'open'::text
);


alter table "public"."forum_topics" enable row level security;

create table "public"."maintenance_requests" (
    "id" uuid not null default uuid_generate_v4(),
    "title" text not null,
    "description" text not null,
    "status" text not null default 'open'::text,
    "priority" text not null default 'medium'::text,
    "unit_id" uuid,
    "reported_by" uuid not null,
    "assigned_to" uuid,
    "resolved_at" timestamp with time zone,
    "resolution_notes" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."maintenance_requests" enable row level security;

create table "public"."post_reactions" (
    "id" uuid not null default uuid_generate_v4(),
    "post_id" uuid not null,
    "user_id" uuid not null,
    "reaction_type" text not null,
    "created_at" timestamp with time zone not null default now()
);


create table "public"."question_responses" (
    "id" uuid not null default uuid_generate_v4(),
    "survey_response_id" uuid not null,
    "question_id" uuid not null,
    "answer_text" text,
    "selected_options" jsonb
);


create table "public"."roles" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "permissions" jsonb not null default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."survey_questions" (
    "id" uuid not null default uuid_generate_v4(),
    "survey_id" uuid not null,
    "question_text" text not null,
    "question_type" text not null,
    "required" boolean default false,
    "order_position" integer not null default 0,
    "options" jsonb
);


create table "public"."survey_responses" (
    "id" uuid not null default uuid_generate_v4(),
    "survey_id" uuid not null,
    "user_id" uuid not null,
    "submitted_at" timestamp with time zone not null default now()
);


create table "public"."surveys" (
    "id" uuid not null default uuid_generate_v4(),
    "title" text not null,
    "description" text,
    "created_by" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "expires_at" timestamp with time zone,
    "published" boolean default false,
    "status" text not null default 'draft'::text
);


create table "public"."topic_subscriptions" (
    "user_id" uuid not null,
    "topic_id" uuid not null,
    "subscription_type" text not null default 'all_posts'::text,
    "created_at" timestamp with time zone not null default now()
);


create table "public"."units" (
    "id" uuid not null default uuid_generate_v4(),
    "unit_number" text not null,
    "floor" integer not null,
    "square_footage" integer,
    "bedrooms" integer,
    "bathrooms" numeric(3,1),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."user_connections" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "connected_user_id" uuid not null,
    "status" text not null default 'pending'::text,
    "established_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."user_memberships" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "membership_tier_id" uuid,
    "start_date" date not null default CURRENT_DATE,
    "end_date" date,
    "payment_status" text,
    "renewal_date" date,
    "approved_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."user_preferences" (
    "user_id" uuid not null,
    "communication_preferences" jsonb default '{"sms": false, "push": true, "email": true}'::jsonb,
    "notification_settings" jsonb default '{"events": true, "forums": true, "maintenance": true, "announcements": true}'::jsonb,
    "privacy_settings" jsonb default '{"share_contact": false, "visible_in_directory": true}'::jsonb,
    "theme_preference" text default 'system'::text,
    "accessibility_settings" jsonb default '{}'::jsonb,
    "email_digest_frequency" text default 'weekly'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."user_profiles" (
    "id" uuid not null,
    "first_name" text,
    "last_name" text,
    "display_name" text,
    "phone" text,
    "unit_id" uuid,
    "profile_picture_url" text,
    "bio" text,
    "occupation" text,
    "move_in_date" date,
    "move_out_date" date,
    "residency_status" text default 'current'::text,
    "alumni_since" date,
    "forwarding_address" text,
    "emergency_contact_name" text,
    "emergency_contact_phone" text,
    "pet_information" jsonb default '[]'::jsonb,
    "languages_spoken" text[],
    "verification_status" text default 'pending'::text,
    "verified_by" uuid,
    "verified_at" timestamp with time zone,
    "verification_notes" text,
    "profile_visibility" text default 'residents_only'::text,
    "social_media_links" jsonb default '{}'::jsonb,
    "profile_completeness" integer default 0,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."user_profiles" enable row level security;

create table "public"."user_roles" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "role_id" uuid not null,
    "assigned_by" uuid,
    "assigned_at" timestamp with time zone not null default now()
);


create table "public"."user_skills" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "skills" text[],
    "interests" text[],
    "community_involvement" text[],
    "volunteer_availability" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


CREATE UNIQUE INDEX ai_configuration_pkey ON public.ai_configuration USING btree (id);

CREATE UNIQUE INDEX ai_context_sources_pkey ON public.ai_context_sources USING btree (id);

CREATE UNIQUE INDEX alumni_membership_tiers_name_key ON public.alumni_membership_tiers USING btree (name);

CREATE UNIQUE INDEX alumni_membership_tiers_pkey ON public.alumni_membership_tiers USING btree (id);

CREATE UNIQUE INDEX announcements_pkey ON public.announcements USING btree (id);

CREATE UNIQUE INDEX category_subscriptions_pkey ON public.category_subscriptions USING btree (user_id, category_id);

CREATE UNIQUE INDEX chat_messages_pkey ON public.chat_messages USING btree (id);

CREATE UNIQUE INDEX chat_sessions_pkey ON public.chat_sessions USING btree (id);

CREATE UNIQUE INDEX comments_pkey ON public.comments USING btree (id);

CREATE UNIQUE INDEX documents_pkey ON public.documents USING btree (id);

CREATE UNIQUE INDEX event_attendees_event_id_user_id_key ON public.event_attendees USING btree (event_id, user_id);

CREATE UNIQUE INDEX event_attendees_pkey ON public.event_attendees USING btree (id);

CREATE UNIQUE INDEX events_pkey ON public.events USING btree (id);

CREATE UNIQUE INDEX file_attachments_pkey ON public.file_attachments USING btree (id);

CREATE UNIQUE INDEX file_categories_name_key ON public.file_categories USING btree (name);

CREATE UNIQUE INDEX file_categories_pkey ON public.file_categories USING btree (id);

CREATE UNIQUE INDEX file_category_items_pkey ON public.file_category_items USING btree (file_id, category_id);

CREATE UNIQUE INDEX files_pkey ON public.files USING btree (id);

CREATE UNIQUE INDEX floor_captain_assignments_pkey ON public.floor_captain_assignments USING btree (id);

CREATE UNIQUE INDEX floor_captain_assignments_user_id_floor_number_key ON public.floor_captain_assignments USING btree (user_id, floor_number);

CREATE UNIQUE INDEX forum_categories_pkey ON public.forum_categories USING btree (id);

CREATE UNIQUE INDEX forum_categories_slug_key ON public.forum_categories USING btree (slug);

CREATE UNIQUE INDEX forum_posts_pkey ON public.forum_posts USING btree (id);

CREATE UNIQUE INDEX forum_topics_category_id_slug_key ON public.forum_topics USING btree (category_id, slug);

CREATE UNIQUE INDEX forum_topics_pkey ON public.forum_topics USING btree (id);

CREATE INDEX idx_comments_parent ON public.comments USING btree (parent_type, parent_id);

CREATE INDEX idx_events_start_time ON public.events USING btree (start_time);

CREATE INDEX idx_file_attachments_attachable ON public.file_attachments USING btree (attachable_type, attachable_id);

CREATE INDEX idx_file_attachments_file_id ON public.file_attachments USING btree (file_id);

CREATE INDEX idx_forum_posts_author_id ON public.forum_posts USING btree (author_id);

CREATE INDEX idx_forum_posts_topic_id ON public.forum_posts USING btree (topic_id);

CREATE INDEX idx_forum_topics_category_id ON public.forum_topics USING btree (category_id);

CREATE INDEX idx_maintenance_requests_status ON public.maintenance_requests USING btree (status);

CREATE INDEX idx_maintenance_requests_unit_id ON public.maintenance_requests USING btree (unit_id);

CREATE INDEX idx_survey_questions_survey_id ON public.survey_questions USING btree (survey_id);

CREATE INDEX idx_user_profiles_residency_status ON public.user_profiles USING btree (residency_status);

CREATE INDEX idx_user_profiles_unit_id ON public.user_profiles USING btree (unit_id);

CREATE INDEX idx_user_profiles_verification_status ON public.user_profiles USING btree (verification_status);

CREATE UNIQUE INDEX maintenance_requests_pkey ON public.maintenance_requests USING btree (id);

CREATE UNIQUE INDEX post_reactions_pkey ON public.post_reactions USING btree (id);

CREATE UNIQUE INDEX post_reactions_post_id_user_id_reaction_type_key ON public.post_reactions USING btree (post_id, user_id, reaction_type);

CREATE UNIQUE INDEX question_responses_pkey ON public.question_responses USING btree (id);

CREATE UNIQUE INDEX question_responses_survey_response_id_question_id_key ON public.question_responses USING btree (survey_response_id, question_id);

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);

CREATE UNIQUE INDEX roles_pkey ON public.roles USING btree (id);

CREATE UNIQUE INDEX survey_questions_pkey ON public.survey_questions USING btree (id);

CREATE UNIQUE INDEX survey_responses_pkey ON public.survey_responses USING btree (id);

CREATE UNIQUE INDEX survey_responses_survey_id_user_id_key ON public.survey_responses USING btree (survey_id, user_id);

CREATE UNIQUE INDEX surveys_pkey ON public.surveys USING btree (id);

CREATE UNIQUE INDEX topic_subscriptions_pkey ON public.topic_subscriptions USING btree (user_id, topic_id);

CREATE UNIQUE INDEX units_pkey ON public.units USING btree (id);

CREATE UNIQUE INDEX units_unit_number_key ON public.units USING btree (unit_number);

CREATE UNIQUE INDEX user_connections_pkey ON public.user_connections USING btree (id);

CREATE UNIQUE INDEX user_connections_user_id_connected_user_id_key ON public.user_connections USING btree (user_id, connected_user_id);

CREATE UNIQUE INDEX user_memberships_pkey ON public.user_memberships USING btree (id);

CREATE UNIQUE INDEX user_preferences_pkey ON public.user_preferences USING btree (user_id);

CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id);

CREATE UNIQUE INDEX user_roles_pkey ON public.user_roles USING btree (id);

CREATE UNIQUE INDEX user_roles_user_id_role_id_key ON public.user_roles USING btree (user_id, role_id);

CREATE UNIQUE INDEX user_skills_pkey ON public.user_skills USING btree (id);

alter table "public"."ai_configuration" add constraint "ai_configuration_pkey" PRIMARY KEY using index "ai_configuration_pkey";

alter table "public"."ai_context_sources" add constraint "ai_context_sources_pkey" PRIMARY KEY using index "ai_context_sources_pkey";

alter table "public"."alumni_membership_tiers" add constraint "alumni_membership_tiers_pkey" PRIMARY KEY using index "alumni_membership_tiers_pkey";

alter table "public"."announcements" add constraint "announcements_pkey" PRIMARY KEY using index "announcements_pkey";

alter table "public"."category_subscriptions" add constraint "category_subscriptions_pkey" PRIMARY KEY using index "category_subscriptions_pkey";

alter table "public"."chat_messages" add constraint "chat_messages_pkey" PRIMARY KEY using index "chat_messages_pkey";

alter table "public"."chat_sessions" add constraint "chat_sessions_pkey" PRIMARY KEY using index "chat_sessions_pkey";

alter table "public"."comments" add constraint "comments_pkey" PRIMARY KEY using index "comments_pkey";

alter table "public"."documents" add constraint "documents_pkey" PRIMARY KEY using index "documents_pkey";

alter table "public"."event_attendees" add constraint "event_attendees_pkey" PRIMARY KEY using index "event_attendees_pkey";

alter table "public"."events" add constraint "events_pkey" PRIMARY KEY using index "events_pkey";

alter table "public"."file_attachments" add constraint "file_attachments_pkey" PRIMARY KEY using index "file_attachments_pkey";

alter table "public"."file_categories" add constraint "file_categories_pkey" PRIMARY KEY using index "file_categories_pkey";

alter table "public"."file_category_items" add constraint "file_category_items_pkey" PRIMARY KEY using index "file_category_items_pkey";

alter table "public"."files" add constraint "files_pkey" PRIMARY KEY using index "files_pkey";

alter table "public"."floor_captain_assignments" add constraint "floor_captain_assignments_pkey" PRIMARY KEY using index "floor_captain_assignments_pkey";

alter table "public"."forum_categories" add constraint "forum_categories_pkey" PRIMARY KEY using index "forum_categories_pkey";

alter table "public"."forum_posts" add constraint "forum_posts_pkey" PRIMARY KEY using index "forum_posts_pkey";

alter table "public"."forum_topics" add constraint "forum_topics_pkey" PRIMARY KEY using index "forum_topics_pkey";

alter table "public"."maintenance_requests" add constraint "maintenance_requests_pkey" PRIMARY KEY using index "maintenance_requests_pkey";

alter table "public"."post_reactions" add constraint "post_reactions_pkey" PRIMARY KEY using index "post_reactions_pkey";

alter table "public"."question_responses" add constraint "question_responses_pkey" PRIMARY KEY using index "question_responses_pkey";

alter table "public"."roles" add constraint "roles_pkey" PRIMARY KEY using index "roles_pkey";

alter table "public"."survey_questions" add constraint "survey_questions_pkey" PRIMARY KEY using index "survey_questions_pkey";

alter table "public"."survey_responses" add constraint "survey_responses_pkey" PRIMARY KEY using index "survey_responses_pkey";

alter table "public"."surveys" add constraint "surveys_pkey" PRIMARY KEY using index "surveys_pkey";

alter table "public"."topic_subscriptions" add constraint "topic_subscriptions_pkey" PRIMARY KEY using index "topic_subscriptions_pkey";

alter table "public"."units" add constraint "units_pkey" PRIMARY KEY using index "units_pkey";

alter table "public"."user_connections" add constraint "user_connections_pkey" PRIMARY KEY using index "user_connections_pkey";

alter table "public"."user_memberships" add constraint "user_memberships_pkey" PRIMARY KEY using index "user_memberships_pkey";

alter table "public"."user_preferences" add constraint "user_preferences_pkey" PRIMARY KEY using index "user_preferences_pkey";

alter table "public"."user_profiles" add constraint "user_profiles_pkey" PRIMARY KEY using index "user_profiles_pkey";

alter table "public"."user_roles" add constraint "user_roles_pkey" PRIMARY KEY using index "user_roles_pkey";

alter table "public"."user_skills" add constraint "user_skills_pkey" PRIMARY KEY using index "user_skills_pkey";

alter table "public"."ai_configuration" add constraint "ai_configuration_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."ai_configuration" validate constraint "ai_configuration_created_by_fkey";

alter table "public"."ai_context_sources" add constraint "ai_context_sources_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."ai_context_sources" validate constraint "ai_context_sources_created_by_fkey";

alter table "public"."ai_context_sources" add constraint "ai_context_sources_source_type_check" CHECK ((source_type = ANY (ARRAY['document'::text, 'database'::text, 'api'::text, 'static'::text]))) not valid;

alter table "public"."ai_context_sources" validate constraint "ai_context_sources_source_type_check";

alter table "public"."ai_context_sources" add constraint "ai_context_sources_update_frequency_check" CHECK ((update_frequency = ANY (ARRAY['realtime'::text, 'daily'::text, 'weekly'::text, 'manual'::text]))) not valid;

alter table "public"."ai_context_sources" validate constraint "ai_context_sources_update_frequency_check";

alter table "public"."alumni_membership_tiers" add constraint "alumni_membership_tiers_name_key" UNIQUE using index "alumni_membership_tiers_name_key";

alter table "public"."announcements" add constraint "announcements_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."announcements" validate constraint "announcements_created_by_fkey";

alter table "public"."announcements" add constraint "announcements_priority_check" CHECK ((priority = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text]))) not valid;

alter table "public"."announcements" validate constraint "announcements_priority_check";

alter table "public"."category_subscriptions" add constraint "category_subscriptions_category_id_fkey" FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE not valid;

alter table "public"."category_subscriptions" validate constraint "category_subscriptions_category_id_fkey";

alter table "public"."category_subscriptions" add constraint "category_subscriptions_subscription_type_check" CHECK ((subscription_type = ANY (ARRAY['all_topics'::text, 'new_topics'::text, 'none'::text]))) not valid;

alter table "public"."category_subscriptions" validate constraint "category_subscriptions_subscription_type_check";

alter table "public"."category_subscriptions" add constraint "category_subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."category_subscriptions" validate constraint "category_subscriptions_user_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_role_check" CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text]))) not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_role_check";

alter table "public"."chat_messages" add constraint "chat_messages_session_id_fkey" FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_session_id_fkey";

alter table "public"."chat_sessions" add constraint "chat_sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."chat_sessions" validate constraint "chat_sessions_user_id_fkey";

alter table "public"."comments" add constraint "comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."comments" validate constraint "comments_user_id_fkey";

alter table "public"."documents" add constraint "documents_uploaded_by_fkey" FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."documents" validate constraint "documents_uploaded_by_fkey";

alter table "public"."event_attendees" add constraint "event_attendees_event_id_fkey" FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE not valid;

alter table "public"."event_attendees" validate constraint "event_attendees_event_id_fkey";

alter table "public"."event_attendees" add constraint "event_attendees_event_id_user_id_key" UNIQUE using index "event_attendees_event_id_user_id_key";

alter table "public"."event_attendees" add constraint "event_attendees_status_check" CHECK ((status = ANY (ARRAY['going'::text, 'maybe'::text, 'not_going'::text]))) not valid;

alter table "public"."event_attendees" validate constraint "event_attendees_status_check";

alter table "public"."event_attendees" add constraint "event_attendees_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."event_attendees" validate constraint "event_attendees_user_id_fkey";

alter table "public"."events" add constraint "events_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."events" validate constraint "events_created_by_fkey";

alter table "public"."events" add constraint "valid_timespan" CHECK ((end_time > start_time)) not valid;

alter table "public"."events" validate constraint "valid_timespan";

alter table "public"."file_attachments" add constraint "file_attachments_added_by_fkey" FOREIGN KEY (added_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."file_attachments" validate constraint "file_attachments_added_by_fkey";

alter table "public"."file_attachments" add constraint "file_attachments_file_id_fkey" FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE not valid;

alter table "public"."file_attachments" validate constraint "file_attachments_file_id_fkey";

alter table "public"."file_categories" add constraint "file_categories_name_key" UNIQUE using index "file_categories_name_key";

alter table "public"."file_category_items" add constraint "file_category_items_category_id_fkey" FOREIGN KEY (category_id) REFERENCES file_categories(id) ON DELETE CASCADE not valid;

alter table "public"."file_category_items" validate constraint "file_category_items_category_id_fkey";

alter table "public"."file_category_items" add constraint "file_category_items_file_id_fkey" FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE not valid;

alter table "public"."file_category_items" validate constraint "file_category_items_file_id_fkey";

alter table "public"."files" add constraint "files_file_type_check" CHECK ((file_type = ANY (ARRAY['image'::text, 'pdf'::text, 'document'::text, 'video'::text, 'audio'::text, 'other'::text]))) not valid;

alter table "public"."files" validate constraint "files_file_type_check";

alter table "public"."files" add constraint "files_privacy_level_check" CHECK ((privacy_level = ANY (ARRAY['private'::text, 'residents'::text, 'admins'::text, 'public'::text]))) not valid;

alter table "public"."files" validate constraint "files_privacy_level_check";

alter table "public"."files" add constraint "files_status_check" CHECK ((status = ANY (ARRAY['processing'::text, 'available'::text, 'quarantined'::text, 'deleted'::text]))) not valid;

alter table "public"."files" validate constraint "files_status_check";

alter table "public"."files" add constraint "files_uploaded_by_fkey" FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."files" validate constraint "files_uploaded_by_fkey";

alter table "public"."floor_captain_assignments" add constraint "floor_captain_assignments_assigned_by_fkey" FOREIGN KEY (assigned_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."floor_captain_assignments" validate constraint "floor_captain_assignments_assigned_by_fkey";

alter table "public"."floor_captain_assignments" add constraint "floor_captain_assignments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."floor_captain_assignments" validate constraint "floor_captain_assignments_user_id_fkey";

alter table "public"."floor_captain_assignments" add constraint "floor_captain_assignments_user_id_floor_number_key" UNIQUE using index "floor_captain_assignments_user_id_floor_number_key";

alter table "public"."forum_categories" add constraint "forum_categories_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."forum_categories" validate constraint "forum_categories_created_by_fkey";

alter table "public"."forum_categories" add constraint "forum_categories_icon_file_id_fkey" FOREIGN KEY (icon_file_id) REFERENCES files(id) ON DELETE SET NULL not valid;

alter table "public"."forum_categories" validate constraint "forum_categories_icon_file_id_fkey";

alter table "public"."forum_categories" add constraint "forum_categories_parent_category_id_fkey" FOREIGN KEY (parent_category_id) REFERENCES forum_categories(id) ON DELETE SET NULL not valid;

alter table "public"."forum_categories" validate constraint "forum_categories_parent_category_id_fkey";

alter table "public"."forum_categories" add constraint "forum_categories_required_role_id_fkey" FOREIGN KEY (required_role_id) REFERENCES roles(id) ON DELETE SET NULL not valid;

alter table "public"."forum_categories" validate constraint "forum_categories_required_role_id_fkey";

alter table "public"."forum_categories" add constraint "forum_categories_slug_key" UNIQUE using index "forum_categories_slug_key";

alter table "public"."forum_posts" add constraint "forum_posts_author_id_fkey" FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."forum_posts" validate constraint "forum_posts_author_id_fkey";

alter table "public"."forum_posts" add constraint "forum_posts_parent_post_id_fkey" FOREIGN KEY (parent_post_id) REFERENCES forum_posts(id) ON DELETE SET NULL not valid;

alter table "public"."forum_posts" validate constraint "forum_posts_parent_post_id_fkey";

alter table "public"."forum_posts" add constraint "forum_posts_topic_id_fkey" FOREIGN KEY (topic_id) REFERENCES forum_topics(id) ON DELETE CASCADE not valid;

alter table "public"."forum_posts" validate constraint "forum_posts_topic_id_fkey";

alter table "public"."forum_topics" add constraint "forum_topics_author_id_fkey" FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."forum_topics" validate constraint "forum_topics_author_id_fkey";

alter table "public"."forum_topics" add constraint "forum_topics_category_id_fkey" FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE not valid;

alter table "public"."forum_topics" validate constraint "forum_topics_category_id_fkey";

alter table "public"."forum_topics" add constraint "forum_topics_category_id_slug_key" UNIQUE using index "forum_topics_category_id_slug_key";

alter table "public"."forum_topics" add constraint "forum_topics_status_check" CHECK ((status = ANY (ARRAY['open'::text, 'resolved'::text, 'closed'::text]))) not valid;

alter table "public"."forum_topics" validate constraint "forum_topics_status_check";

alter table "public"."maintenance_requests" add constraint "maintenance_requests_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."maintenance_requests" validate constraint "maintenance_requests_assigned_to_fkey";

alter table "public"."maintenance_requests" add constraint "maintenance_requests_priority_check" CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text]))) not valid;

alter table "public"."maintenance_requests" validate constraint "maintenance_requests_priority_check";

alter table "public"."maintenance_requests" add constraint "maintenance_requests_reported_by_fkey" FOREIGN KEY (reported_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."maintenance_requests" validate constraint "maintenance_requests_reported_by_fkey";

alter table "public"."maintenance_requests" add constraint "maintenance_requests_status_check" CHECK ((status = ANY (ARRAY['open'::text, 'in_progress'::text, 'waiting'::text, 'resolved'::text, 'closed'::text]))) not valid;

alter table "public"."maintenance_requests" validate constraint "maintenance_requests_status_check";

alter table "public"."maintenance_requests" add constraint "maintenance_requests_unit_id_fkey" FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL not valid;

alter table "public"."maintenance_requests" validate constraint "maintenance_requests_unit_id_fkey";

alter table "public"."post_reactions" add constraint "post_reactions_post_id_fkey" FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE not valid;

alter table "public"."post_reactions" validate constraint "post_reactions_post_id_fkey";

alter table "public"."post_reactions" add constraint "post_reactions_post_id_user_id_reaction_type_key" UNIQUE using index "post_reactions_post_id_user_id_reaction_type_key";

alter table "public"."post_reactions" add constraint "post_reactions_reaction_type_check" CHECK ((reaction_type = ANY (ARRAY['like'::text, 'helpful'::text, 'agree'::text, 'disagree'::text, 'thanks'::text, 'insightful'::text]))) not valid;

alter table "public"."post_reactions" validate constraint "post_reactions_reaction_type_check";

alter table "public"."post_reactions" add constraint "post_reactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."post_reactions" validate constraint "post_reactions_user_id_fkey";

alter table "public"."question_responses" add constraint "question_responses_question_id_fkey" FOREIGN KEY (question_id) REFERENCES survey_questions(id) ON DELETE CASCADE not valid;

alter table "public"."question_responses" validate constraint "question_responses_question_id_fkey";

alter table "public"."question_responses" add constraint "question_responses_survey_response_id_fkey" FOREIGN KEY (survey_response_id) REFERENCES survey_responses(id) ON DELETE CASCADE not valid;

alter table "public"."question_responses" validate constraint "question_responses_survey_response_id_fkey";

alter table "public"."question_responses" add constraint "question_responses_survey_response_id_question_id_key" UNIQUE using index "question_responses_survey_response_id_question_id_key";

alter table "public"."roles" add constraint "roles_name_key" UNIQUE using index "roles_name_key";

alter table "public"."survey_questions" add constraint "survey_questions_question_type_check" CHECK ((question_type = ANY (ARRAY['text'::text, 'multiple_choice'::text, 'single_choice'::text, 'rating'::text, 'boolean'::text]))) not valid;

alter table "public"."survey_questions" validate constraint "survey_questions_question_type_check";

alter table "public"."survey_questions" add constraint "survey_questions_survey_id_fkey" FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE not valid;

alter table "public"."survey_questions" validate constraint "survey_questions_survey_id_fkey";

alter table "public"."survey_responses" add constraint "survey_responses_survey_id_fkey" FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE not valid;

alter table "public"."survey_responses" validate constraint "survey_responses_survey_id_fkey";

alter table "public"."survey_responses" add constraint "survey_responses_survey_id_user_id_key" UNIQUE using index "survey_responses_survey_id_user_id_key";

alter table "public"."survey_responses" add constraint "survey_responses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."survey_responses" validate constraint "survey_responses_user_id_fkey";

alter table "public"."surveys" add constraint "surveys_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."surveys" validate constraint "surveys_created_by_fkey";

alter table "public"."surveys" add constraint "surveys_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'closed'::text, 'archived'::text]))) not valid;

alter table "public"."surveys" validate constraint "surveys_status_check";

alter table "public"."topic_subscriptions" add constraint "topic_subscriptions_subscription_type_check" CHECK ((subscription_type = ANY (ARRAY['all_posts'::text, 'mentions'::text, 'none'::text]))) not valid;

alter table "public"."topic_subscriptions" validate constraint "topic_subscriptions_subscription_type_check";

alter table "public"."topic_subscriptions" add constraint "topic_subscriptions_topic_id_fkey" FOREIGN KEY (topic_id) REFERENCES forum_topics(id) ON DELETE CASCADE not valid;

alter table "public"."topic_subscriptions" validate constraint "topic_subscriptions_topic_id_fkey";

alter table "public"."topic_subscriptions" add constraint "topic_subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."topic_subscriptions" validate constraint "topic_subscriptions_user_id_fkey";

alter table "public"."units" add constraint "units_unit_number_key" UNIQUE using index "units_unit_number_key";

alter table "public"."user_connections" add constraint "different_users" CHECK ((user_id <> connected_user_id)) not valid;

alter table "public"."user_connections" validate constraint "different_users";

alter table "public"."user_connections" add constraint "user_connections_connected_user_id_fkey" FOREIGN KEY (connected_user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_connections" validate constraint "user_connections_connected_user_id_fkey";

alter table "public"."user_connections" add constraint "user_connections_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'blocked'::text]))) not valid;

alter table "public"."user_connections" validate constraint "user_connections_status_check";

alter table "public"."user_connections" add constraint "user_connections_user_id_connected_user_id_key" UNIQUE using index "user_connections_user_id_connected_user_id_key";

alter table "public"."user_connections" add constraint "user_connections_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_connections" validate constraint "user_connections_user_id_fkey";

alter table "public"."user_memberships" add constraint "user_memberships_approved_by_fkey" FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."user_memberships" validate constraint "user_memberships_approved_by_fkey";

alter table "public"."user_memberships" add constraint "user_memberships_membership_tier_id_fkey" FOREIGN KEY (membership_tier_id) REFERENCES alumni_membership_tiers(id) ON DELETE SET NULL not valid;

alter table "public"."user_memberships" validate constraint "user_memberships_membership_tier_id_fkey";

alter table "public"."user_memberships" add constraint "user_memberships_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_memberships" validate constraint "user_memberships_user_id_fkey";

alter table "public"."user_preferences" add constraint "user_preferences_email_digest_frequency_check" CHECK ((email_digest_frequency = ANY (ARRAY['daily'::text, 'weekly'::text, 'none'::text]))) not valid;

alter table "public"."user_preferences" validate constraint "user_preferences_email_digest_frequency_check";

alter table "public"."user_preferences" add constraint "user_preferences_theme_preference_check" CHECK ((theme_preference = ANY (ARRAY['light'::text, 'dark'::text, 'system'::text]))) not valid;

alter table "public"."user_preferences" validate constraint "user_preferences_theme_preference_check";

alter table "public"."user_preferences" add constraint "user_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_preferences" validate constraint "user_preferences_user_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_profile_visibility_check" CHECK ((profile_visibility = ANY (ARRAY['public'::text, 'residents_only'::text, 'private'::text]))) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_profile_visibility_check";

alter table "public"."user_profiles" add constraint "user_profiles_residency_status_check" CHECK ((residency_status = ANY (ARRAY['current'::text, 'alumni'::text, 'inactive'::text]))) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_residency_status_check";

alter table "public"."user_profiles" add constraint "user_profiles_unit_id_fkey" FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_unit_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_verification_status_check" CHECK ((verification_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_verification_status_check";

alter table "public"."user_profiles" add constraint "user_profiles_verified_by_fkey" FOREIGN KEY (verified_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_verified_by_fkey";

alter table "public"."user_roles" add constraint "user_roles_assigned_by_fkey" FOREIGN KEY (assigned_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."user_roles" validate constraint "user_roles_assigned_by_fkey";

alter table "public"."user_roles" add constraint "user_roles_role_id_fkey" FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_role_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_user_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_user_id_role_id_key" UNIQUE using index "user_roles_user_id_role_id_key";

alter table "public"."user_skills" add constraint "user_skills_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_skills" validate constraint "user_skills_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_forum_topic_last_post_time()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE forum_topics 
  SET last_post_at = NEW.created_at
  WHERE id = NEW.topic_id;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."ai_configuration" to "anon";

grant insert on table "public"."ai_configuration" to "anon";

grant references on table "public"."ai_configuration" to "anon";

grant select on table "public"."ai_configuration" to "anon";

grant trigger on table "public"."ai_configuration" to "anon";

grant truncate on table "public"."ai_configuration" to "anon";

grant update on table "public"."ai_configuration" to "anon";

grant delete on table "public"."ai_configuration" to "authenticated";

grant insert on table "public"."ai_configuration" to "authenticated";

grant references on table "public"."ai_configuration" to "authenticated";

grant select on table "public"."ai_configuration" to "authenticated";

grant trigger on table "public"."ai_configuration" to "authenticated";

grant truncate on table "public"."ai_configuration" to "authenticated";

grant update on table "public"."ai_configuration" to "authenticated";

grant delete on table "public"."ai_configuration" to "service_role";

grant insert on table "public"."ai_configuration" to "service_role";

grant references on table "public"."ai_configuration" to "service_role";

grant select on table "public"."ai_configuration" to "service_role";

grant trigger on table "public"."ai_configuration" to "service_role";

grant truncate on table "public"."ai_configuration" to "service_role";

grant update on table "public"."ai_configuration" to "service_role";

grant delete on table "public"."ai_context_sources" to "anon";

grant insert on table "public"."ai_context_sources" to "anon";

grant references on table "public"."ai_context_sources" to "anon";

grant select on table "public"."ai_context_sources" to "anon";

grant trigger on table "public"."ai_context_sources" to "anon";

grant truncate on table "public"."ai_context_sources" to "anon";

grant update on table "public"."ai_context_sources" to "anon";

grant delete on table "public"."ai_context_sources" to "authenticated";

grant insert on table "public"."ai_context_sources" to "authenticated";

grant references on table "public"."ai_context_sources" to "authenticated";

grant select on table "public"."ai_context_sources" to "authenticated";

grant trigger on table "public"."ai_context_sources" to "authenticated";

grant truncate on table "public"."ai_context_sources" to "authenticated";

grant update on table "public"."ai_context_sources" to "authenticated";

grant delete on table "public"."ai_context_sources" to "service_role";

grant insert on table "public"."ai_context_sources" to "service_role";

grant references on table "public"."ai_context_sources" to "service_role";

grant select on table "public"."ai_context_sources" to "service_role";

grant trigger on table "public"."ai_context_sources" to "service_role";

grant truncate on table "public"."ai_context_sources" to "service_role";

grant update on table "public"."ai_context_sources" to "service_role";

grant delete on table "public"."alumni_membership_tiers" to "anon";

grant insert on table "public"."alumni_membership_tiers" to "anon";

grant references on table "public"."alumni_membership_tiers" to "anon";

grant select on table "public"."alumni_membership_tiers" to "anon";

grant trigger on table "public"."alumni_membership_tiers" to "anon";

grant truncate on table "public"."alumni_membership_tiers" to "anon";

grant update on table "public"."alumni_membership_tiers" to "anon";

grant delete on table "public"."alumni_membership_tiers" to "authenticated";

grant insert on table "public"."alumni_membership_tiers" to "authenticated";

grant references on table "public"."alumni_membership_tiers" to "authenticated";

grant select on table "public"."alumni_membership_tiers" to "authenticated";

grant trigger on table "public"."alumni_membership_tiers" to "authenticated";

grant truncate on table "public"."alumni_membership_tiers" to "authenticated";

grant update on table "public"."alumni_membership_tiers" to "authenticated";

grant delete on table "public"."alumni_membership_tiers" to "service_role";

grant insert on table "public"."alumni_membership_tiers" to "service_role";

grant references on table "public"."alumni_membership_tiers" to "service_role";

grant select on table "public"."alumni_membership_tiers" to "service_role";

grant trigger on table "public"."alumni_membership_tiers" to "service_role";

grant truncate on table "public"."alumni_membership_tiers" to "service_role";

grant update on table "public"."alumni_membership_tiers" to "service_role";

grant delete on table "public"."announcements" to "anon";

grant insert on table "public"."announcements" to "anon";

grant references on table "public"."announcements" to "anon";

grant select on table "public"."announcements" to "anon";

grant trigger on table "public"."announcements" to "anon";

grant truncate on table "public"."announcements" to "anon";

grant update on table "public"."announcements" to "anon";

grant delete on table "public"."announcements" to "authenticated";

grant insert on table "public"."announcements" to "authenticated";

grant references on table "public"."announcements" to "authenticated";

grant select on table "public"."announcements" to "authenticated";

grant trigger on table "public"."announcements" to "authenticated";

grant truncate on table "public"."announcements" to "authenticated";

grant update on table "public"."announcements" to "authenticated";

grant delete on table "public"."announcements" to "service_role";

grant insert on table "public"."announcements" to "service_role";

grant references on table "public"."announcements" to "service_role";

grant select on table "public"."announcements" to "service_role";

grant trigger on table "public"."announcements" to "service_role";

grant truncate on table "public"."announcements" to "service_role";

grant update on table "public"."announcements" to "service_role";

grant delete on table "public"."category_subscriptions" to "anon";

grant insert on table "public"."category_subscriptions" to "anon";

grant references on table "public"."category_subscriptions" to "anon";

grant select on table "public"."category_subscriptions" to "anon";

grant trigger on table "public"."category_subscriptions" to "anon";

grant truncate on table "public"."category_subscriptions" to "anon";

grant update on table "public"."category_subscriptions" to "anon";

grant delete on table "public"."category_subscriptions" to "authenticated";

grant insert on table "public"."category_subscriptions" to "authenticated";

grant references on table "public"."category_subscriptions" to "authenticated";

grant select on table "public"."category_subscriptions" to "authenticated";

grant trigger on table "public"."category_subscriptions" to "authenticated";

grant truncate on table "public"."category_subscriptions" to "authenticated";

grant update on table "public"."category_subscriptions" to "authenticated";

grant delete on table "public"."category_subscriptions" to "service_role";

grant insert on table "public"."category_subscriptions" to "service_role";

grant references on table "public"."category_subscriptions" to "service_role";

grant select on table "public"."category_subscriptions" to "service_role";

grant trigger on table "public"."category_subscriptions" to "service_role";

grant truncate on table "public"."category_subscriptions" to "service_role";

grant update on table "public"."category_subscriptions" to "service_role";

grant delete on table "public"."chat_messages" to "anon";

grant insert on table "public"."chat_messages" to "anon";

grant references on table "public"."chat_messages" to "anon";

grant select on table "public"."chat_messages" to "anon";

grant trigger on table "public"."chat_messages" to "anon";

grant truncate on table "public"."chat_messages" to "anon";

grant update on table "public"."chat_messages" to "anon";

grant delete on table "public"."chat_messages" to "authenticated";

grant insert on table "public"."chat_messages" to "authenticated";

grant references on table "public"."chat_messages" to "authenticated";

grant select on table "public"."chat_messages" to "authenticated";

grant trigger on table "public"."chat_messages" to "authenticated";

grant truncate on table "public"."chat_messages" to "authenticated";

grant update on table "public"."chat_messages" to "authenticated";

grant delete on table "public"."chat_messages" to "service_role";

grant insert on table "public"."chat_messages" to "service_role";

grant references on table "public"."chat_messages" to "service_role";

grant select on table "public"."chat_messages" to "service_role";

grant trigger on table "public"."chat_messages" to "service_role";

grant truncate on table "public"."chat_messages" to "service_role";

grant update on table "public"."chat_messages" to "service_role";

grant delete on table "public"."chat_sessions" to "anon";

grant insert on table "public"."chat_sessions" to "anon";

grant references on table "public"."chat_sessions" to "anon";

grant select on table "public"."chat_sessions" to "anon";

grant trigger on table "public"."chat_sessions" to "anon";

grant truncate on table "public"."chat_sessions" to "anon";

grant update on table "public"."chat_sessions" to "anon";

grant delete on table "public"."chat_sessions" to "authenticated";

grant insert on table "public"."chat_sessions" to "authenticated";

grant references on table "public"."chat_sessions" to "authenticated";

grant select on table "public"."chat_sessions" to "authenticated";

grant trigger on table "public"."chat_sessions" to "authenticated";

grant truncate on table "public"."chat_sessions" to "authenticated";

grant update on table "public"."chat_sessions" to "authenticated";

grant delete on table "public"."chat_sessions" to "service_role";

grant insert on table "public"."chat_sessions" to "service_role";

grant references on table "public"."chat_sessions" to "service_role";

grant select on table "public"."chat_sessions" to "service_role";

grant trigger on table "public"."chat_sessions" to "service_role";

grant truncate on table "public"."chat_sessions" to "service_role";

grant update on table "public"."chat_sessions" to "service_role";

grant delete on table "public"."comments" to "anon";

grant insert on table "public"."comments" to "anon";

grant references on table "public"."comments" to "anon";

grant select on table "public"."comments" to "anon";

grant trigger on table "public"."comments" to "anon";

grant truncate on table "public"."comments" to "anon";

grant update on table "public"."comments" to "anon";

grant delete on table "public"."comments" to "authenticated";

grant insert on table "public"."comments" to "authenticated";

grant references on table "public"."comments" to "authenticated";

grant select on table "public"."comments" to "authenticated";

grant trigger on table "public"."comments" to "authenticated";

grant truncate on table "public"."comments" to "authenticated";

grant update on table "public"."comments" to "authenticated";

grant delete on table "public"."comments" to "service_role";

grant insert on table "public"."comments" to "service_role";

grant references on table "public"."comments" to "service_role";

grant select on table "public"."comments" to "service_role";

grant trigger on table "public"."comments" to "service_role";

grant truncate on table "public"."comments" to "service_role";

grant update on table "public"."comments" to "service_role";

grant delete on table "public"."documents" to "anon";

grant insert on table "public"."documents" to "anon";

grant references on table "public"."documents" to "anon";

grant select on table "public"."documents" to "anon";

grant trigger on table "public"."documents" to "anon";

grant truncate on table "public"."documents" to "anon";

grant update on table "public"."documents" to "anon";

grant delete on table "public"."documents" to "authenticated";

grant insert on table "public"."documents" to "authenticated";

grant references on table "public"."documents" to "authenticated";

grant select on table "public"."documents" to "authenticated";

grant trigger on table "public"."documents" to "authenticated";

grant truncate on table "public"."documents" to "authenticated";

grant update on table "public"."documents" to "authenticated";

grant delete on table "public"."documents" to "service_role";

grant insert on table "public"."documents" to "service_role";

grant references on table "public"."documents" to "service_role";

grant select on table "public"."documents" to "service_role";

grant trigger on table "public"."documents" to "service_role";

grant truncate on table "public"."documents" to "service_role";

grant update on table "public"."documents" to "service_role";

grant delete on table "public"."event_attendees" to "anon";

grant insert on table "public"."event_attendees" to "anon";

grant references on table "public"."event_attendees" to "anon";

grant select on table "public"."event_attendees" to "anon";

grant trigger on table "public"."event_attendees" to "anon";

grant truncate on table "public"."event_attendees" to "anon";

grant update on table "public"."event_attendees" to "anon";

grant delete on table "public"."event_attendees" to "authenticated";

grant insert on table "public"."event_attendees" to "authenticated";

grant references on table "public"."event_attendees" to "authenticated";

grant select on table "public"."event_attendees" to "authenticated";

grant trigger on table "public"."event_attendees" to "authenticated";

grant truncate on table "public"."event_attendees" to "authenticated";

grant update on table "public"."event_attendees" to "authenticated";

grant delete on table "public"."event_attendees" to "service_role";

grant insert on table "public"."event_attendees" to "service_role";

grant references on table "public"."event_attendees" to "service_role";

grant select on table "public"."event_attendees" to "service_role";

grant trigger on table "public"."event_attendees" to "service_role";

grant truncate on table "public"."event_attendees" to "service_role";

grant update on table "public"."event_attendees" to "service_role";

grant delete on table "public"."events" to "anon";

grant insert on table "public"."events" to "anon";

grant references on table "public"."events" to "anon";

grant select on table "public"."events" to "anon";

grant trigger on table "public"."events" to "anon";

grant truncate on table "public"."events" to "anon";

grant update on table "public"."events" to "anon";

grant delete on table "public"."events" to "authenticated";

grant insert on table "public"."events" to "authenticated";

grant references on table "public"."events" to "authenticated";

grant select on table "public"."events" to "authenticated";

grant trigger on table "public"."events" to "authenticated";

grant truncate on table "public"."events" to "authenticated";

grant update on table "public"."events" to "authenticated";

grant delete on table "public"."events" to "service_role";

grant insert on table "public"."events" to "service_role";

grant references on table "public"."events" to "service_role";

grant select on table "public"."events" to "service_role";

grant trigger on table "public"."events" to "service_role";

grant truncate on table "public"."events" to "service_role";

grant update on table "public"."events" to "service_role";

grant delete on table "public"."file_attachments" to "anon";

grant insert on table "public"."file_attachments" to "anon";

grant references on table "public"."file_attachments" to "anon";

grant select on table "public"."file_attachments" to "anon";

grant trigger on table "public"."file_attachments" to "anon";

grant truncate on table "public"."file_attachments" to "anon";

grant update on table "public"."file_attachments" to "anon";

grant delete on table "public"."file_attachments" to "authenticated";

grant insert on table "public"."file_attachments" to "authenticated";

grant references on table "public"."file_attachments" to "authenticated";

grant select on table "public"."file_attachments" to "authenticated";

grant trigger on table "public"."file_attachments" to "authenticated";

grant truncate on table "public"."file_attachments" to "authenticated";

grant update on table "public"."file_attachments" to "authenticated";

grant delete on table "public"."file_attachments" to "service_role";

grant insert on table "public"."file_attachments" to "service_role";

grant references on table "public"."file_attachments" to "service_role";

grant select on table "public"."file_attachments" to "service_role";

grant trigger on table "public"."file_attachments" to "service_role";

grant truncate on table "public"."file_attachments" to "service_role";

grant update on table "public"."file_attachments" to "service_role";

grant delete on table "public"."file_categories" to "anon";

grant insert on table "public"."file_categories" to "anon";

grant references on table "public"."file_categories" to "anon";

grant select on table "public"."file_categories" to "anon";

grant trigger on table "public"."file_categories" to "anon";

grant truncate on table "public"."file_categories" to "anon";

grant update on table "public"."file_categories" to "anon";

grant delete on table "public"."file_categories" to "authenticated";

grant insert on table "public"."file_categories" to "authenticated";

grant references on table "public"."file_categories" to "authenticated";

grant select on table "public"."file_categories" to "authenticated";

grant trigger on table "public"."file_categories" to "authenticated";

grant truncate on table "public"."file_categories" to "authenticated";

grant update on table "public"."file_categories" to "authenticated";

grant delete on table "public"."file_categories" to "service_role";

grant insert on table "public"."file_categories" to "service_role";

grant references on table "public"."file_categories" to "service_role";

grant select on table "public"."file_categories" to "service_role";

grant trigger on table "public"."file_categories" to "service_role";

grant truncate on table "public"."file_categories" to "service_role";

grant update on table "public"."file_categories" to "service_role";

grant delete on table "public"."file_category_items" to "anon";

grant insert on table "public"."file_category_items" to "anon";

grant references on table "public"."file_category_items" to "anon";

grant select on table "public"."file_category_items" to "anon";

grant trigger on table "public"."file_category_items" to "anon";

grant truncate on table "public"."file_category_items" to "anon";

grant update on table "public"."file_category_items" to "anon";

grant delete on table "public"."file_category_items" to "authenticated";

grant insert on table "public"."file_category_items" to "authenticated";

grant references on table "public"."file_category_items" to "authenticated";

grant select on table "public"."file_category_items" to "authenticated";

grant trigger on table "public"."file_category_items" to "authenticated";

grant truncate on table "public"."file_category_items" to "authenticated";

grant update on table "public"."file_category_items" to "authenticated";

grant delete on table "public"."file_category_items" to "service_role";

grant insert on table "public"."file_category_items" to "service_role";

grant references on table "public"."file_category_items" to "service_role";

grant select on table "public"."file_category_items" to "service_role";

grant trigger on table "public"."file_category_items" to "service_role";

grant truncate on table "public"."file_category_items" to "service_role";

grant update on table "public"."file_category_items" to "service_role";

grant delete on table "public"."files" to "anon";

grant insert on table "public"."files" to "anon";

grant references on table "public"."files" to "anon";

grant select on table "public"."files" to "anon";

grant trigger on table "public"."files" to "anon";

grant truncate on table "public"."files" to "anon";

grant update on table "public"."files" to "anon";

grant delete on table "public"."files" to "authenticated";

grant insert on table "public"."files" to "authenticated";

grant references on table "public"."files" to "authenticated";

grant select on table "public"."files" to "authenticated";

grant trigger on table "public"."files" to "authenticated";

grant truncate on table "public"."files" to "authenticated";

grant update on table "public"."files" to "authenticated";

grant delete on table "public"."files" to "service_role";

grant insert on table "public"."files" to "service_role";

grant references on table "public"."files" to "service_role";

grant select on table "public"."files" to "service_role";

grant trigger on table "public"."files" to "service_role";

grant truncate on table "public"."files" to "service_role";

grant update on table "public"."files" to "service_role";

grant delete on table "public"."floor_captain_assignments" to "anon";

grant insert on table "public"."floor_captain_assignments" to "anon";

grant references on table "public"."floor_captain_assignments" to "anon";

grant select on table "public"."floor_captain_assignments" to "anon";

grant trigger on table "public"."floor_captain_assignments" to "anon";

grant truncate on table "public"."floor_captain_assignments" to "anon";

grant update on table "public"."floor_captain_assignments" to "anon";

grant delete on table "public"."floor_captain_assignments" to "authenticated";

grant insert on table "public"."floor_captain_assignments" to "authenticated";

grant references on table "public"."floor_captain_assignments" to "authenticated";

grant select on table "public"."floor_captain_assignments" to "authenticated";

grant trigger on table "public"."floor_captain_assignments" to "authenticated";

grant truncate on table "public"."floor_captain_assignments" to "authenticated";

grant update on table "public"."floor_captain_assignments" to "authenticated";

grant delete on table "public"."floor_captain_assignments" to "service_role";

grant insert on table "public"."floor_captain_assignments" to "service_role";

grant references on table "public"."floor_captain_assignments" to "service_role";

grant select on table "public"."floor_captain_assignments" to "service_role";

grant trigger on table "public"."floor_captain_assignments" to "service_role";

grant truncate on table "public"."floor_captain_assignments" to "service_role";

grant update on table "public"."floor_captain_assignments" to "service_role";

grant delete on table "public"."forum_categories" to "anon";

grant insert on table "public"."forum_categories" to "anon";

grant references on table "public"."forum_categories" to "anon";

grant select on table "public"."forum_categories" to "anon";

grant trigger on table "public"."forum_categories" to "anon";

grant truncate on table "public"."forum_categories" to "anon";

grant update on table "public"."forum_categories" to "anon";

grant delete on table "public"."forum_categories" to "authenticated";

grant insert on table "public"."forum_categories" to "authenticated";

grant references on table "public"."forum_categories" to "authenticated";

grant select on table "public"."forum_categories" to "authenticated";

grant trigger on table "public"."forum_categories" to "authenticated";

grant truncate on table "public"."forum_categories" to "authenticated";

grant update on table "public"."forum_categories" to "authenticated";

grant delete on table "public"."forum_categories" to "service_role";

grant insert on table "public"."forum_categories" to "service_role";

grant references on table "public"."forum_categories" to "service_role";

grant select on table "public"."forum_categories" to "service_role";

grant trigger on table "public"."forum_categories" to "service_role";

grant truncate on table "public"."forum_categories" to "service_role";

grant update on table "public"."forum_categories" to "service_role";

grant delete on table "public"."forum_posts" to "anon";

grant insert on table "public"."forum_posts" to "anon";

grant references on table "public"."forum_posts" to "anon";

grant select on table "public"."forum_posts" to "anon";

grant trigger on table "public"."forum_posts" to "anon";

grant truncate on table "public"."forum_posts" to "anon";

grant update on table "public"."forum_posts" to "anon";

grant delete on table "public"."forum_posts" to "authenticated";

grant insert on table "public"."forum_posts" to "authenticated";

grant references on table "public"."forum_posts" to "authenticated";

grant select on table "public"."forum_posts" to "authenticated";

grant trigger on table "public"."forum_posts" to "authenticated";

grant truncate on table "public"."forum_posts" to "authenticated";

grant update on table "public"."forum_posts" to "authenticated";

grant delete on table "public"."forum_posts" to "service_role";

grant insert on table "public"."forum_posts" to "service_role";

grant references on table "public"."forum_posts" to "service_role";

grant select on table "public"."forum_posts" to "service_role";

grant trigger on table "public"."forum_posts" to "service_role";

grant truncate on table "public"."forum_posts" to "service_role";

grant update on table "public"."forum_posts" to "service_role";

grant delete on table "public"."forum_topics" to "anon";

grant insert on table "public"."forum_topics" to "anon";

grant references on table "public"."forum_topics" to "anon";

grant select on table "public"."forum_topics" to "anon";

grant trigger on table "public"."forum_topics" to "anon";

grant truncate on table "public"."forum_topics" to "anon";

grant update on table "public"."forum_topics" to "anon";

grant delete on table "public"."forum_topics" to "authenticated";

grant insert on table "public"."forum_topics" to "authenticated";

grant references on table "public"."forum_topics" to "authenticated";

grant select on table "public"."forum_topics" to "authenticated";

grant trigger on table "public"."forum_topics" to "authenticated";

grant truncate on table "public"."forum_topics" to "authenticated";

grant update on table "public"."forum_topics" to "authenticated";

grant delete on table "public"."forum_topics" to "service_role";

grant insert on table "public"."forum_topics" to "service_role";

grant references on table "public"."forum_topics" to "service_role";

grant select on table "public"."forum_topics" to "service_role";

grant trigger on table "public"."forum_topics" to "service_role";

grant truncate on table "public"."forum_topics" to "service_role";

grant update on table "public"."forum_topics" to "service_role";

grant delete on table "public"."maintenance_requests" to "anon";

grant insert on table "public"."maintenance_requests" to "anon";

grant references on table "public"."maintenance_requests" to "anon";

grant select on table "public"."maintenance_requests" to "anon";

grant trigger on table "public"."maintenance_requests" to "anon";

grant truncate on table "public"."maintenance_requests" to "anon";

grant update on table "public"."maintenance_requests" to "anon";

grant delete on table "public"."maintenance_requests" to "authenticated";

grant insert on table "public"."maintenance_requests" to "authenticated";

grant references on table "public"."maintenance_requests" to "authenticated";

grant select on table "public"."maintenance_requests" to "authenticated";

grant trigger on table "public"."maintenance_requests" to "authenticated";

grant truncate on table "public"."maintenance_requests" to "authenticated";

grant update on table "public"."maintenance_requests" to "authenticated";

grant delete on table "public"."maintenance_requests" to "service_role";

grant insert on table "public"."maintenance_requests" to "service_role";

grant references on table "public"."maintenance_requests" to "service_role";

grant select on table "public"."maintenance_requests" to "service_role";

grant trigger on table "public"."maintenance_requests" to "service_role";

grant truncate on table "public"."maintenance_requests" to "service_role";

grant update on table "public"."maintenance_requests" to "service_role";

grant delete on table "public"."post_reactions" to "anon";

grant insert on table "public"."post_reactions" to "anon";

grant references on table "public"."post_reactions" to "anon";

grant select on table "public"."post_reactions" to "anon";

grant trigger on table "public"."post_reactions" to "anon";

grant truncate on table "public"."post_reactions" to "anon";

grant update on table "public"."post_reactions" to "anon";

grant delete on table "public"."post_reactions" to "authenticated";

grant insert on table "public"."post_reactions" to "authenticated";

grant references on table "public"."post_reactions" to "authenticated";

grant select on table "public"."post_reactions" to "authenticated";

grant trigger on table "public"."post_reactions" to "authenticated";

grant truncate on table "public"."post_reactions" to "authenticated";

grant update on table "public"."post_reactions" to "authenticated";

grant delete on table "public"."post_reactions" to "service_role";

grant insert on table "public"."post_reactions" to "service_role";

grant references on table "public"."post_reactions" to "service_role";

grant select on table "public"."post_reactions" to "service_role";

grant trigger on table "public"."post_reactions" to "service_role";

grant truncate on table "public"."post_reactions" to "service_role";

grant update on table "public"."post_reactions" to "service_role";

grant delete on table "public"."question_responses" to "anon";

grant insert on table "public"."question_responses" to "anon";

grant references on table "public"."question_responses" to "anon";

grant select on table "public"."question_responses" to "anon";

grant trigger on table "public"."question_responses" to "anon";

grant truncate on table "public"."question_responses" to "anon";

grant update on table "public"."question_responses" to "anon";

grant delete on table "public"."question_responses" to "authenticated";

grant insert on table "public"."question_responses" to "authenticated";

grant references on table "public"."question_responses" to "authenticated";

grant select on table "public"."question_responses" to "authenticated";

grant trigger on table "public"."question_responses" to "authenticated";

grant truncate on table "public"."question_responses" to "authenticated";

grant update on table "public"."question_responses" to "authenticated";

grant delete on table "public"."question_responses" to "service_role";

grant insert on table "public"."question_responses" to "service_role";

grant references on table "public"."question_responses" to "service_role";

grant select on table "public"."question_responses" to "service_role";

grant trigger on table "public"."question_responses" to "service_role";

grant truncate on table "public"."question_responses" to "service_role";

grant update on table "public"."question_responses" to "service_role";

grant delete on table "public"."roles" to "anon";

grant insert on table "public"."roles" to "anon";

grant references on table "public"."roles" to "anon";

grant select on table "public"."roles" to "anon";

grant trigger on table "public"."roles" to "anon";

grant truncate on table "public"."roles" to "anon";

grant update on table "public"."roles" to "anon";

grant delete on table "public"."roles" to "authenticated";

grant insert on table "public"."roles" to "authenticated";

grant references on table "public"."roles" to "authenticated";

grant select on table "public"."roles" to "authenticated";

grant trigger on table "public"."roles" to "authenticated";

grant truncate on table "public"."roles" to "authenticated";

grant update on table "public"."roles" to "authenticated";

grant delete on table "public"."roles" to "service_role";

grant insert on table "public"."roles" to "service_role";

grant references on table "public"."roles" to "service_role";

grant select on table "public"."roles" to "service_role";

grant trigger on table "public"."roles" to "service_role";

grant truncate on table "public"."roles" to "service_role";

grant update on table "public"."roles" to "service_role";

grant delete on table "public"."survey_questions" to "anon";

grant insert on table "public"."survey_questions" to "anon";

grant references on table "public"."survey_questions" to "anon";

grant select on table "public"."survey_questions" to "anon";

grant trigger on table "public"."survey_questions" to "anon";

grant truncate on table "public"."survey_questions" to "anon";

grant update on table "public"."survey_questions" to "anon";

grant delete on table "public"."survey_questions" to "authenticated";

grant insert on table "public"."survey_questions" to "authenticated";

grant references on table "public"."survey_questions" to "authenticated";

grant select on table "public"."survey_questions" to "authenticated";

grant trigger on table "public"."survey_questions" to "authenticated";

grant truncate on table "public"."survey_questions" to "authenticated";

grant update on table "public"."survey_questions" to "authenticated";

grant delete on table "public"."survey_questions" to "service_role";

grant insert on table "public"."survey_questions" to "service_role";

grant references on table "public"."survey_questions" to "service_role";

grant select on table "public"."survey_questions" to "service_role";

grant trigger on table "public"."survey_questions" to "service_role";

grant truncate on table "public"."survey_questions" to "service_role";

grant update on table "public"."survey_questions" to "service_role";

grant delete on table "public"."survey_responses" to "anon";

grant insert on table "public"."survey_responses" to "anon";

grant references on table "public"."survey_responses" to "anon";

grant select on table "public"."survey_responses" to "anon";

grant trigger on table "public"."survey_responses" to "anon";

grant truncate on table "public"."survey_responses" to "anon";

grant update on table "public"."survey_responses" to "anon";

grant delete on table "public"."survey_responses" to "authenticated";

grant insert on table "public"."survey_responses" to "authenticated";

grant references on table "public"."survey_responses" to "authenticated";

grant select on table "public"."survey_responses" to "authenticated";

grant trigger on table "public"."survey_responses" to "authenticated";

grant truncate on table "public"."survey_responses" to "authenticated";

grant update on table "public"."survey_responses" to "authenticated";

grant delete on table "public"."survey_responses" to "service_role";

grant insert on table "public"."survey_responses" to "service_role";

grant references on table "public"."survey_responses" to "service_role";

grant select on table "public"."survey_responses" to "service_role";

grant trigger on table "public"."survey_responses" to "service_role";

grant truncate on table "public"."survey_responses" to "service_role";

grant update on table "public"."survey_responses" to "service_role";

grant delete on table "public"."surveys" to "anon";

grant insert on table "public"."surveys" to "anon";

grant references on table "public"."surveys" to "anon";

grant select on table "public"."surveys" to "anon";

grant trigger on table "public"."surveys" to "anon";

grant truncate on table "public"."surveys" to "anon";

grant update on table "public"."surveys" to "anon";

grant delete on table "public"."surveys" to "authenticated";

grant insert on table "public"."surveys" to "authenticated";

grant references on table "public"."surveys" to "authenticated";

grant select on table "public"."surveys" to "authenticated";

grant trigger on table "public"."surveys" to "authenticated";

grant truncate on table "public"."surveys" to "authenticated";

grant update on table "public"."surveys" to "authenticated";

grant delete on table "public"."surveys" to "service_role";

grant insert on table "public"."surveys" to "service_role";

grant references on table "public"."surveys" to "service_role";

grant select on table "public"."surveys" to "service_role";

grant trigger on table "public"."surveys" to "service_role";

grant truncate on table "public"."surveys" to "service_role";

grant update on table "public"."surveys" to "service_role";

grant delete on table "public"."topic_subscriptions" to "anon";

grant insert on table "public"."topic_subscriptions" to "anon";

grant references on table "public"."topic_subscriptions" to "anon";

grant select on table "public"."topic_subscriptions" to "anon";

grant trigger on table "public"."topic_subscriptions" to "anon";

grant truncate on table "public"."topic_subscriptions" to "anon";

grant update on table "public"."topic_subscriptions" to "anon";

grant delete on table "public"."topic_subscriptions" to "authenticated";

grant insert on table "public"."topic_subscriptions" to "authenticated";

grant references on table "public"."topic_subscriptions" to "authenticated";

grant select on table "public"."topic_subscriptions" to "authenticated";

grant trigger on table "public"."topic_subscriptions" to "authenticated";

grant truncate on table "public"."topic_subscriptions" to "authenticated";

grant update on table "public"."topic_subscriptions" to "authenticated";

grant delete on table "public"."topic_subscriptions" to "service_role";

grant insert on table "public"."topic_subscriptions" to "service_role";

grant references on table "public"."topic_subscriptions" to "service_role";

grant select on table "public"."topic_subscriptions" to "service_role";

grant trigger on table "public"."topic_subscriptions" to "service_role";

grant truncate on table "public"."topic_subscriptions" to "service_role";

grant update on table "public"."topic_subscriptions" to "service_role";

grant delete on table "public"."units" to "anon";

grant insert on table "public"."units" to "anon";

grant references on table "public"."units" to "anon";

grant select on table "public"."units" to "anon";

grant trigger on table "public"."units" to "anon";

grant truncate on table "public"."units" to "anon";

grant update on table "public"."units" to "anon";

grant delete on table "public"."units" to "authenticated";

grant insert on table "public"."units" to "authenticated";

grant references on table "public"."units" to "authenticated";

grant select on table "public"."units" to "authenticated";

grant trigger on table "public"."units" to "authenticated";

grant truncate on table "public"."units" to "authenticated";

grant update on table "public"."units" to "authenticated";

grant delete on table "public"."units" to "service_role";

grant insert on table "public"."units" to "service_role";

grant references on table "public"."units" to "service_role";

grant select on table "public"."units" to "service_role";

grant trigger on table "public"."units" to "service_role";

grant truncate on table "public"."units" to "service_role";

grant update on table "public"."units" to "service_role";

grant delete on table "public"."user_connections" to "anon";

grant insert on table "public"."user_connections" to "anon";

grant references on table "public"."user_connections" to "anon";

grant select on table "public"."user_connections" to "anon";

grant trigger on table "public"."user_connections" to "anon";

grant truncate on table "public"."user_connections" to "anon";

grant update on table "public"."user_connections" to "anon";

grant delete on table "public"."user_connections" to "authenticated";

grant insert on table "public"."user_connections" to "authenticated";

grant references on table "public"."user_connections" to "authenticated";

grant select on table "public"."user_connections" to "authenticated";

grant trigger on table "public"."user_connections" to "authenticated";

grant truncate on table "public"."user_connections" to "authenticated";

grant update on table "public"."user_connections" to "authenticated";

grant delete on table "public"."user_connections" to "service_role";

grant insert on table "public"."user_connections" to "service_role";

grant references on table "public"."user_connections" to "service_role";

grant select on table "public"."user_connections" to "service_role";

grant trigger on table "public"."user_connections" to "service_role";

grant truncate on table "public"."user_connections" to "service_role";

grant update on table "public"."user_connections" to "service_role";

grant delete on table "public"."user_memberships" to "anon";

grant insert on table "public"."user_memberships" to "anon";

grant references on table "public"."user_memberships" to "anon";

grant select on table "public"."user_memberships" to "anon";

grant trigger on table "public"."user_memberships" to "anon";

grant truncate on table "public"."user_memberships" to "anon";

grant update on table "public"."user_memberships" to "anon";

grant delete on table "public"."user_memberships" to "authenticated";

grant insert on table "public"."user_memberships" to "authenticated";

grant references on table "public"."user_memberships" to "authenticated";

grant select on table "public"."user_memberships" to "authenticated";

grant trigger on table "public"."user_memberships" to "authenticated";

grant truncate on table "public"."user_memberships" to "authenticated";

grant update on table "public"."user_memberships" to "authenticated";

grant delete on table "public"."user_memberships" to "service_role";

grant insert on table "public"."user_memberships" to "service_role";

grant references on table "public"."user_memberships" to "service_role";

grant select on table "public"."user_memberships" to "service_role";

grant trigger on table "public"."user_memberships" to "service_role";

grant truncate on table "public"."user_memberships" to "service_role";

grant update on table "public"."user_memberships" to "service_role";

grant delete on table "public"."user_preferences" to "anon";

grant insert on table "public"."user_preferences" to "anon";

grant references on table "public"."user_preferences" to "anon";

grant select on table "public"."user_preferences" to "anon";

grant trigger on table "public"."user_preferences" to "anon";

grant truncate on table "public"."user_preferences" to "anon";

grant update on table "public"."user_preferences" to "anon";

grant delete on table "public"."user_preferences" to "authenticated";

grant insert on table "public"."user_preferences" to "authenticated";

grant references on table "public"."user_preferences" to "authenticated";

grant select on table "public"."user_preferences" to "authenticated";

grant trigger on table "public"."user_preferences" to "authenticated";

grant truncate on table "public"."user_preferences" to "authenticated";

grant update on table "public"."user_preferences" to "authenticated";

grant delete on table "public"."user_preferences" to "service_role";

grant insert on table "public"."user_preferences" to "service_role";

grant references on table "public"."user_preferences" to "service_role";

grant select on table "public"."user_preferences" to "service_role";

grant trigger on table "public"."user_preferences" to "service_role";

grant truncate on table "public"."user_preferences" to "service_role";

grant update on table "public"."user_preferences" to "service_role";

grant delete on table "public"."user_profiles" to "anon";

grant insert on table "public"."user_profiles" to "anon";

grant references on table "public"."user_profiles" to "anon";

grant select on table "public"."user_profiles" to "anon";

grant trigger on table "public"."user_profiles" to "anon";

grant truncate on table "public"."user_profiles" to "anon";

grant update on table "public"."user_profiles" to "anon";

grant delete on table "public"."user_profiles" to "authenticated";

grant insert on table "public"."user_profiles" to "authenticated";

grant references on table "public"."user_profiles" to "authenticated";

grant select on table "public"."user_profiles" to "authenticated";

grant trigger on table "public"."user_profiles" to "authenticated";

grant truncate on table "public"."user_profiles" to "authenticated";

grant update on table "public"."user_profiles" to "authenticated";

grant delete on table "public"."user_profiles" to "service_role";

grant insert on table "public"."user_profiles" to "service_role";

grant references on table "public"."user_profiles" to "service_role";

grant select on table "public"."user_profiles" to "service_role";

grant trigger on table "public"."user_profiles" to "service_role";

grant truncate on table "public"."user_profiles" to "service_role";

grant update on table "public"."user_profiles" to "service_role";

grant delete on table "public"."user_roles" to "anon";

grant insert on table "public"."user_roles" to "anon";

grant references on table "public"."user_roles" to "anon";

grant select on table "public"."user_roles" to "anon";

grant trigger on table "public"."user_roles" to "anon";

grant truncate on table "public"."user_roles" to "anon";

grant update on table "public"."user_roles" to "anon";

grant delete on table "public"."user_roles" to "authenticated";

grant insert on table "public"."user_roles" to "authenticated";

grant references on table "public"."user_roles" to "authenticated";

grant select on table "public"."user_roles" to "authenticated";

grant trigger on table "public"."user_roles" to "authenticated";

grant truncate on table "public"."user_roles" to "authenticated";

grant update on table "public"."user_roles" to "authenticated";

grant delete on table "public"."user_roles" to "service_role";

grant insert on table "public"."user_roles" to "service_role";

grant references on table "public"."user_roles" to "service_role";

grant select on table "public"."user_roles" to "service_role";

grant trigger on table "public"."user_roles" to "service_role";

grant truncate on table "public"."user_roles" to "service_role";

grant update on table "public"."user_roles" to "service_role";

grant delete on table "public"."user_skills" to "anon";

grant insert on table "public"."user_skills" to "anon";

grant references on table "public"."user_skills" to "anon";

grant select on table "public"."user_skills" to "anon";

grant trigger on table "public"."user_skills" to "anon";

grant truncate on table "public"."user_skills" to "anon";

grant update on table "public"."user_skills" to "anon";

grant delete on table "public"."user_skills" to "authenticated";

grant insert on table "public"."user_skills" to "authenticated";

grant references on table "public"."user_skills" to "authenticated";

grant select on table "public"."user_skills" to "authenticated";

grant trigger on table "public"."user_skills" to "authenticated";

grant truncate on table "public"."user_skills" to "authenticated";

grant update on table "public"."user_skills" to "authenticated";

grant delete on table "public"."user_skills" to "service_role";

grant insert on table "public"."user_skills" to "service_role";

grant references on table "public"."user_skills" to "service_role";

grant select on table "public"."user_skills" to "service_role";

grant trigger on table "public"."user_skills" to "service_role";

grant truncate on table "public"."user_skills" to "service_role";

grant update on table "public"."user_skills" to "service_role";

create policy "Users can see their own chat messages"
on "public"."chat_messages"
as permissive
for select
to public
using ((session_id IN ( SELECT chat_sessions.id
   FROM chat_sessions
  WHERE (chat_sessions.user_id = auth.uid()))));


create policy "Users can see their own maintenance requests"
on "public"."maintenance_requests"
as permissive
for select
to public
using ((auth.uid() = reported_by));


create policy "Users can see their own profiles"
on "public"."user_profiles"
as permissive
for select
to public
using ((auth.uid() = id));


CREATE TRIGGER update_topic_timestamp AFTER INSERT ON public.forum_posts FOR EACH ROW EXECUTE FUNCTION update_forum_topic_last_post_time();

CREATE TRIGGER update_user_profile_timestamp BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_timestamp();


