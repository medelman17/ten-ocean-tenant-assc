# Inngest Architecture for 10 Ocean Tenant Association

This document outlines our event-driven architecture using Inngest for the 10 Ocean Tenant Association application.

## Overview

Inngest provides a reliable event-driven workflow system that we'll use to handle asynchronous processes, background jobs, and event-driven features in our application. This allows us to build complex workflows, such as user verification, notification systems, and scheduled tasks, without maintaining complex infrastructure.

## Core Event Types

We'll use the following standardized event types:

1. **User Events**
   - `user/registered` - Triggered when a new user completes registration
   - `user/verified` - Triggered when an admin approves a user
   - `user/rejected` - Triggered when an admin rejects a user
   - `user/profile.updated` - Triggered when a user updates their profile
   - `user/status.changed` - Triggered when a user's status changes (e.g., resident → alumni)

2. **Notification Events**
   - `notification/email.send` - Trigger to send an email
   - `notification/push.send` - Trigger to send a push notification
   - `notification/digest.generate` - Trigger to generate a periodic digest

3. **Community Events**
   - `event/created` - Triggered when a new community event is created
   - `event/updated` - Triggered when an event is updated
   - `event/reminder` - Triggered to send event reminders
   - `event/rsvp.changed` - Triggered when a user RSVPs to an event

4. **Maintenance Events**
   - `maintenance/request.created` - Triggered when a maintenance request is created
   - `maintenance/request.assigned` - Triggered when a request is assigned
   - `maintenance/request.updated` - Triggered when a request is updated
   - `maintenance/request.resolved` - Triggered when a request is resolved

5. **Forum Events**
   - `forum/topic.created` - Triggered when a new topic is created
   - `forum/post.created` - Triggered when a new post is created
   - `forum/mention` - Triggered when a user is mentioned

## Key Workflows

### User Verification Workflow

```
[user registers] → user/registered → [create profile record] → [notify admins] → 
[admin reviews] → user/verified OR user/rejected → [update user status] → [notify user]
```

1. When a user registers, we emit a `user/registered` event
2. This triggers a workflow that:
   - Creates a verification record in the database
   - Notifies relevant admins or floor captains
3. When an admin approves/rejects, we emit `user/verified` or `user/rejected`
4. This triggers workflows to update the user's status and send notifications

### Notification System

```
[event occurs] → [specific event type] → [determine notification preferences] → 
[format notification] → notification/email.send OR notification/push.send
```

1. Various events trigger notification workflows
2. Based on user preferences, notifications are routed appropriately
3. We can implement delivery retries, rate limiting, and batching

### Weekly Digest

```
[scheduled cron] → notification/digest.generate → [collect relevant information] → 
[personalize for user] → notification/email.send
```

1. A scheduled job runs weekly to generate content digests
2. We collect recent announcements, events, and forum activity
3. Personalize based on user preferences and send as an email

## Implementation Plan

### 1. Set up Inngest Client

Create a central Inngest client in `lib/inngest/client.ts`:

```typescript
import { Inngest } from "inngest";

// Create a client with your app identifier
export const inngest = new Inngest({ 
  id: "ten-ocean-tenant-assc",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
```

### 2. Create the API Route

Set up an API endpoint for Inngest to call our functions:

```typescript
// app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import * as functions from "@/lib/inngest/functions";

export const { GET, POST } = serve({
  client: inngest,
  functions: Object.values(functions),
});
```

### 3. Define Events Structure

Create typed events to ensure consistency:

```typescript
// lib/inngest/events.ts
export interface Events {
  "user/registered": {
    data: {
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
      unitId?: string;
    };
  };
  "user/verified": {
    data: {
      userId: string;
      verifiedBy: string;
      timestamp: string;
    };
  };
  // Additional event types...
}
```

### 4. Implement Workflows

Create functions for each workflow:

```typescript
// lib/inngest/functions/user-verification.ts
import { inngest } from "../client";
import type { Events } from "../events";

export const userRegistrationWorkflow = inngest.createFunction(
  { id: "user-registration-workflow" },
  { event: "user/registered" },
  async ({ event, step }) => {
    // Notify admins
    await step.run("notify-admins", async () => {
      // Implementation details...
    });
    
    // Add to verification queue
    await step.run("add-to-verification-queue", async () => {
      // Implementation details...
    });
  }
);
```

## Best Practices

1. **Event Schema Consistency**
   - Use TypeScript types to ensure event data consistency
   - Include standardized fields like timestamps, user IDs, etc.

2. **Function Idempotency**
   - Design functions to be idempotent (can be run multiple times without side effects)
   - Use transactions or locking when needed

3. **Error Handling**
   - Implement proper error handling in all functions
   - Use step.run() for automatic retries on specific parts of a workflow

4. **Testing**
   - Write tests for each function using Inngest's testing utilities
   - Test both success and failure scenarios

5. **Monitoring**
   - Use Inngest's built-in monitoring and observability features
   - Set up alerts for critical workflow failures

## Development Workflow

1. During development, run the Inngest dev server:
   ```
   npx inngest-cli@latest dev
   ```

2. Test functions in isolation using the Inngest dev UI

3. Evolve the event schema and functions as needed, but maintain backward compatibility

## Production Considerations

1. Set up proper environment variables for production
2. Configure the Inngest Vercel integration for deployments
3. Monitor execution and error rates
4. Set up appropriate retries and backoff strategies