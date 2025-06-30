# Custom Functions and Triggers Migration Analysis

**Migration:** Ten Ocean Tenant Association - Supabase to Neon + Prisma  
**Phase:** 2.4 - Migrate Custom Functions and Logic  
**Date:** January 2025  
**Status:** 📋 IN ANALYSIS  

## Overview

This document analyzes the custom database functions and triggers from the Supabase schema and outlines the migration strategy to the new Prisma + Neon setup.

## Identified Custom Logic

### 🔧 Custom Functions (2 total)

#### 1. `update_forum_topic_last_post_time()`
```sql
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
```
- **Purpose:** Updates the `last_post_at` timestamp in `forum_topics` when a new post is created
- **Trigger:** `update_topic_timestamp` (AFTER INSERT on `forum_posts`)
- **Business Impact:** Critical for forum functionality - shows when topics were last active

#### 2. `update_timestamp()`
```sql
CREATE OR REPLACE FUNCTION public.update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
```
- **Purpose:** Automatically updates the `updated_at` field with current timestamp
- **Trigger:** `update_user_profile_timestamp` (BEFORE UPDATE on `user_profiles`)
- **Business Impact:** Essential for audit trails and change tracking

### ⚡ Triggers (2 total)

#### 1. `update_topic_timestamp`
```sql
CREATE TRIGGER update_topic_timestamp 
AFTER INSERT ON public.forum_posts 
FOR EACH ROW EXECUTE FUNCTION update_forum_topic_last_post_time();
```

#### 2. `update_user_profile_timestamp`
```sql
CREATE TRIGGER update_user_profile_timestamp 
BEFORE UPDATE ON public.user_profiles 
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

## Migration Strategy Options

### 🏆 Recommended: Hybrid Approach (Prisma + Database Fallback)

**Primary Implementation:** Prisma Middleware/Extensions
**Fallback:** Database triggers for data integrity

#### Benefits:
- ✅ Type-safe and maintainable in TypeScript
- ✅ Better debugging and testing capabilities
- ✅ Database-level fallback ensures data integrity
- ✅ Gradual migration path
- ✅ Performance optimization opportunities

#### Implementation Plan:
1. **Create Prisma Extensions** for the logic
2. **Deploy database triggers** as fallback
3. **Test both implementations**
4. **Monitor and optimize**

### 🔄 Alternative Approaches

#### Option A: Pure Prisma Middleware
- Implement all logic in Prisma middleware
- Remove database triggers entirely
- **Risk:** Application failures could bypass logic

#### Option B: Database-Only Triggers
- Keep existing triggers in PostgreSQL
- Deploy as raw SQL migrations
- **Risk:** Logic not visible in application code

#### Option C: Application Code Only
- Handle in route handlers/services
- No database-level enforcement
- **Risk:** Easy to bypass or forget

## Implementation Details

### Prisma Extension Implementation

#### Forum Topic Last Post Update
```typescript
// lib/prisma/extensions/forum-topic-updater.ts
export const forumTopicUpdater = Prisma.defineExtension({
  query: {
    forumPost: {
      create({ args, query }) {
        return query(args).then(async (result) => {
          if (result.topicId) {
            await prisma.forumTopic.update({
              where: { id: result.topicId },
              data: { lastPostAt: result.createdAt }
            });
          }
          return result;
        });
      }
    }
  }
});
```

#### Auto-Update Timestamps
```typescript
// lib/prisma/extensions/auto-timestamps.ts
export const autoTimestamps = Prisma.defineExtension({
  query: {
    userProfile: {
      update({ args, query }) {
        args.data.updatedAt = new Date();
        return query(args);
      }
    }
  }
});
```

### Database Fallback Implementation

#### Deploy Existing Functions
```sql
-- migrations/001_custom_functions.sql
CREATE OR REPLACE FUNCTION update_forum_topic_last_post_time()
RETURNS trigger AS $$
BEGIN
  UPDATE "ForumTopic" 
  SET "lastPostAt" = NEW."createdAt"
  WHERE id = NEW."topicId";
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Deploy Triggers
```sql
-- migrations/002_custom_triggers.sql
CREATE TRIGGER update_topic_timestamp 
  AFTER INSERT ON "ForumPost" 
  FOR EACH ROW EXECUTE FUNCTION update_forum_topic_last_post_time();

CREATE TRIGGER update_user_profile_timestamp 
  BEFORE UPDATE ON "UserProfile" 
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

## Testing Strategy

### Unit Tests
- Test Prisma extensions in isolation
- Mock database responses
- Verify timestamp generation

### Integration Tests
- Test with real database
- Verify both Prisma and trigger implementations
- Performance benchmarking

### Data Integrity Tests
- Simulate application failures
- Verify database triggers still work
- Test edge cases and race conditions

## Rollback Plan

1. **Disable Prisma extensions** if issues arise
2. **Rely on database triggers** for consistency
3. **Fix issues** and re-enable extensions
4. **Monitor logs** for any gaps

## Success Metrics

- ✅ All forum posts update topic timestamps correctly
- ✅ All user profile updates have proper timestamps
- ✅ No performance degradation
- ✅ 100% test coverage for custom logic
- ✅ Zero data integrity issues

## Next Steps

1. **Create Prisma extensions** for both functions
2. **Deploy database triggers** as SQL migrations
3. **Update Prisma client** configuration
4. **Write comprehensive tests**
5. **Deploy and monitor** the implementation

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|---------|-------------|------------|
| Logic bypass | High | Low | Database triggers as fallback |
| Performance issues | Medium | Low | Benchmarking and optimization |
| Testing gaps | Medium | Medium | Comprehensive test suite |
| Migration errors | High | Low | Rollback plan and monitoring |

---

**Status:** Ready for implementation  
**Estimated Time:** 4-6 hours  
**Dependencies:** Prisma schema validation complete 