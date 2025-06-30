-- Custom Functions Migration for Ten Ocean Tenant Association
-- Converts Supabase custom functions to work with Prisma table names
-- Migration Phase: 2.4 - Custom Functions and Logic

-- Function: Update forum topic last post time
-- Replaces: update_forum_topic_last_post_time() from Supabase
-- Purpose: Updates forum_topics.lastPostAt when a new forum_posts is created
CREATE OR REPLACE FUNCTION update_forum_topic_last_post_time()
RETURNS trigger AS $$
BEGIN
  -- Update the parent topic's lastPostAt with the new post's createdAt timestamp
  UPDATE "forum_topics" 
  SET "lastPostAt" = NEW."createdAt"
  WHERE id = NEW."topicId";
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Auto-update timestamps
-- Replaces: update_timestamp() from Supabase  
-- Purpose: Automatically set updatedAt to current timestamp on row updates
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS trigger AS $$
BEGIN
  -- Set the updatedAt field to the current timestamp
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Role-based permissions removed as they were Supabase-specific
-- In Neon PostgreSQL, functions are accessible to the database owner by default 