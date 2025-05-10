import { Inngest } from "inngest"

// Create a client with the app identifier
export const inngest = new Inngest({
  id: "ten-ocean-tenant-assc",
  // Environment-based event key
  eventKey: process.env.INNGEST_EVENT_KEY || ""
})