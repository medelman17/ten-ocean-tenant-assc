/**
 * Index file for Inngest
 * This exports all the necessary functions to easily import elsewhere
 */

// Export the client
export { inngest } from "./client"

// Export event types
export type { Events } from "./events"

// Export all available functions
export * from "./functions/user-verification"
export * from "./functions/email-notifications"

// Helper functions for sending events
import { inngest } from "./client"

/**
 * Send an email notification event
 */
export async function sendEmailNotification(data: {
  to: string
  subject?: string
  template: string
  templateData: Record<string, unknown>
}) {
  return inngest.send({
    name: "notification/email.send",
    data: {
      ...data,
      subject: data.subject || "", // Will be overridden by template if not provided
      timestamp: new Date().toISOString()
    }
  })
}

/**
 * Send a user registration event to trigger the verification workflow
 */
export async function sendUserRegisteredEvent(data: {
  userId: string
  email: string
  firstName: string
  lastName: string
  unitId?: string
}) {
  return inngest.send({
    name: "user/registered",
    data: {
      ...data,
      createdAt: new Date().toISOString()
    }
  })
}

/**
 * Send a user verification event to mark a user as verified
 */
export async function sendUserVerifiedEvent(data: {
  userId: string
  verifiedBy: string
  notes?: string
}) {
  return inngest.send({
    name: "user/verified",
    data: {
      ...data,
      timestamp: new Date().toISOString()
    }
  })
}

/**
 * Send a user rejection event to mark a user as rejected
 */
export async function sendUserRejectedEvent(data: {
  userId: string
  rejectedBy: string
  reason?: string
}) {
  return inngest.send({
    name: "user/rejected",
    data: {
      ...data,
      timestamp: new Date().toISOString()
    }
  })
}