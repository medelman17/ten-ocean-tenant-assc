import { serve } from "inngest/next"
import { inngest } from "@/lib/inngest/client"

// Import all function workflows
import {
  userVerificationWorkflow,
  userApprovalWorkflow,
  userRejectionWorkflow
} from "@/lib/inngest/functions/user-verification"

// This creates an HTTP server for Inngest functions.
// All Inngest functions will be served from this endpoint.
export const { GET, POST } = serve({
  client: inngest,
  functions: [
    // Add all workflows here
    userVerificationWorkflow,
    userApprovalWorkflow,
    userRejectionWorkflow,
  ],
})