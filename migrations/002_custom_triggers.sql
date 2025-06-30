-- Custom Triggers Migration for Ten Ocean Tenant Association
-- Converts Supabase custom triggers to work with Prisma table names
-- Migration Phase: 2.4 - Custom Functions and Logic

-- Trigger: Update forum topic timestamp when new post is created
-- Replaces: update_topic_timestamp from Supabase
-- Purpose: Automatically update forum_topics.lastPostAt when forum_posts is inserted
CREATE TRIGGER update_topic_timestamp 
  AFTER INSERT ON "forum_posts" 
  FOR EACH ROW 
  EXECUTE FUNCTION update_forum_topic_last_post_time();

-- Trigger: Auto-update user profile timestamps
-- Replaces: update_user_profile_timestamp from Supabase
-- Purpose: Automatically update user_profiles.updatedAt when user_profiles is updated
CREATE TRIGGER update_user_profile_timestamp 
  BEFORE UPDATE ON "user_profiles" 
  FOR EACH ROW 
  EXECUTE FUNCTION update_timestamp();

-- Optional: Add more timestamp triggers for other critical tables
-- These weren't in the original Supabase schema but may be beneficial

-- Trigger for forum_topics updates
CREATE TRIGGER update_forum_topic_timestamp 
  BEFORE UPDATE ON "forum_topics" 
  FOR EACH ROW 
  EXECUTE FUNCTION update_timestamp();

-- Trigger for events updates
CREATE TRIGGER update_event_timestamp 
  BEFORE UPDATE ON "events" 
  FOR EACH ROW 
  EXECUTE FUNCTION update_timestamp();

-- Trigger for maintenance_requests updates
CREATE TRIGGER update_maintenance_request_timestamp 
  BEFORE UPDATE ON "maintenance_requests" 
  FOR EACH ROW 
  EXECUTE FUNCTION update_timestamp();

-- Comments about trigger behavior:
-- - AFTER INSERT triggers run after the row is inserted, good for updating related tables
-- - BEFORE UPDATE triggers run before the update, good for modifying the row being updated
-- - All triggers include FOR EACH ROW to ensure they fire for every affected row 