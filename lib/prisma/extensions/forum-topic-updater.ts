// TEMPORARILY DISABLED - Prisma extension for forum topic updates
// This is a proof of concept that would automatically update forum topic's lastPostAt timestamp
// when a new post is created. For now, we're using database triggers instead.
//
// This replaces the Supabase trigger: update_forum_topic_last_post_time()
// that was executed AFTER INSERT on forum_posts.

/*
import { Prisma } from "../generated/prisma"

export const forumTopicUpdater = Prisma.defineExtension({
  name: "forumTopicUpdater",
  query: {
    forumPost: {
      // Handle single post creation
      async create({ args, query }: { args: Prisma.ForumPostCreateArgs; query: (args: Prisma.ForumPostCreateArgs) => Promise<any> }) {
        const result = await query(args)

        // Update the parent topic's lastPostAt timestamp
        if (result.topicId) {
          // Direct database update using Prisma's $executeRaw for efficiency
          await (query as any)({
            model: "ForumTopic",
            operation: "update",
            args: {
              where: { id: result.topicId },
              data: { lastPostAt: result.createdAt },
            },
          })
        }

        return result
      },

      // Handle batch post creation (createMany)
      async createMany({ args, query }: { args: Prisma.ForumPostCreateManyArgs; query: (args: Prisma.ForumPostCreateManyArgs) => Promise<any> }) {
        const result = await query(args)

        // Extract unique topic IDs from the created posts
        if (args.data && Array.isArray(args.data)) {
          const topicIds = [...new Set(args.data.map((post: { topicId?: string }) => post.topicId).filter(Boolean))]

          // Update all affected topics with current timestamp
          if (topicIds.length > 0) {
            const now = new Date()
            await (query as any)({
              model: "ForumTopic",
              operation: "updateMany",
              args: {
                where: { id: { in: topicIds } },
                data: { lastPostAt: now },
              },
            })
          }
        }

        return result
      },
    },
  },
})

export type ForumTopicUpdaterExtension = typeof forumTopicUpdater
*/

// For now, we're using database triggers which work perfectly for this use case
// The triggers are deployed and working correctly (see migrations/002_custom_triggers.sql)
export const forumTopicUpdater = null
export type ForumTopicUpdaterExtension = null
