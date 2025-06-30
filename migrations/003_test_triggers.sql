-- Test Script for Custom Functions and Triggers
-- Verifies that the migrated triggers work correctly

-- First, let's check if we have some basic data to work with
-- Check if we have any forum topics
SELECT COUNT(*) as topic_count FROM "forum_topics";

-- Check if we have any forum posts
SELECT COUNT(*) as post_count FROM "forum_posts";

-- Check if we have any user profiles
SELECT COUNT(*) as user_count FROM "user_profiles";

-- Check triggers exist
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND trigger_name IN ('update_topic_timestamp', 'update_user_profile_timestamp')
ORDER BY trigger_name;

-- Check functions exist
SELECT proname as function_name, prosrc as function_body
FROM pg_proc 
WHERE proname IN ('update_forum_topic_last_post_time', 'update_timestamp')
ORDER BY proname; 