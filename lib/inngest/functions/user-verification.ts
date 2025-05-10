import { inngest } from "../client"
import { createServiceClient } from "@/lib/supabase/service-client"
import { UserApproverInfo } from "@/lib/types/db"

/**
 * User registration workflow
 * 
 * This function is triggered when a new user registers.
 * It performs the following steps:
 * 1. Creates a verification record
 * 2. Notifies relevant admins or floor captains
 */
export const userVerificationWorkflow = inngest.createFunction(
  { id: "user-verification-workflow" },
  { event: "user/registered" },
  async ({ event, step }) => {
    const { userId, email, firstName, lastName, unitId } = event.data
    
    // Log the start of the workflow
    console.log(`Starting verification workflow for user ${userId} (${email})`)
    
    // Step 1: Update user profile with pending verification status
    // (This is a safety check as this should already be done during registration)
    await step.run("ensure-pending-verification", async () => {
      const supabase = createServiceClient()
      
      const { data, error } = await supabase
        .from("user_profiles")
        .update({ verification_status: "pending" })
        .eq("id", userId)
        .select()
        .single()
        
      if (error) {
        throw new Error(`Failed to update user profile: ${error.message}`)
      }
      
      return data
    })
    
    // Step 2: Find appropriate floor captains or admins to notify
    // If a unit is provided, we'll find the floor captain for that floor
    // Otherwise, we'll notify all admins
    const notifyList = await step.run("find-approvers", async () => {
      const supabase = createServiceClient()
      
      // If we have a unit, get its floor to find the floor captain
      if (unitId) {
        const { data: unit } = await supabase
          .from("units")
          .select("floor")
          .eq("id", unitId)
          .single()
        
        if (unit) {
          // Find floor captains for this floor
          const { data: floorCaptains } = await supabase
            .from("floor_captain_assignments")
            .select(`
              user_id,
              user_profiles!inner (
                first_name,
                last_name,
                email
              )
            `)
            .eq("floor_number", unit.floor)
          
          if (floorCaptains && floorCaptains.length > 0) {
            // Create a properly typed array of FloorCaptainInfo
            type CaptainType = {
              user_id: string;
              user_profiles: {
                email: string;
                first_name: string;
                last_name: string;
              };
            };

            // Cast to the proper type to satisfy TypeScript
            const typedCaptains = floorCaptains as unknown as CaptainType[];

            return typedCaptains.map(fc => ({
              userId: fc.user_id,
              email: fc.user_profiles.email || "",
              name: `${fc.user_profiles.first_name || ""} ${fc.user_profiles.last_name || ""}`
            } as UserApproverInfo))
          }
        }
      }
      
      // Default: notify all admins
      const { data: admins } = await supabase
        .from("user_roles")
        .select(`
          user_id,
          roles!inner (name),
          user_profiles!inner (
            first_name, 
            last_name,
            email
          )
        `)
        .eq("roles.name", "Admin")
      
      if (!admins || admins.length === 0) {
        throw new Error("No admins found to notify for user verification")
      }
      
      // Create a properly typed array for admins
      type AdminType = {
        user_id: string;
        user_profiles: {
          email: string;
          first_name: string;
          last_name: string;
        };
      };

      // Cast to the proper type to satisfy TypeScript
      const typedAdmins = admins as unknown as AdminType[];

      return typedAdmins.map(admin => ({
        userId: admin.user_id,
        email: admin.user_profiles.email || "",
        name: `${admin.user_profiles.first_name || ""} ${admin.user_profiles.last_name || ""}`
      } as UserApproverInfo))
    })
    
    // Step 3: Send notification to each approver
    await step.run("send-notifications", async () => {
      // For now, we'll just log the notifications
      // In a real implementation, this would send actual emails or push notifications
      console.log(`Sending verification notifications to ${notifyList.length} approvers:`)

      for (const approver of notifyList) {
        // Send an email notification
        // Here we'd trigger the notification/email.send event
        await inngest.send({
          name: "notification/email.send",
          data: {
            to: approver.email,
            subject: "New User Verification Required",
            template: "user-verification",
            templateData: {
              approverName: approver.name,
              userName: `${firstName} ${lastName}`,
              userEmail: email,
              userId: userId,
              verificationLink: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/verify-user/${userId}`
            },
            timestamp: new Date().toISOString()
          }
        })
        
        console.log(`- Notification sent to ${approver.name} (${approver.email})`)
      }
      
      return { notifiedCount: notifyList.length }
    })
    
    // Final step: Return workflow result
    return {
      userId,
      verification: {
        status: "pending",
        notifiedApprovers: notifyList.length
      }
    }
  }
)

/**
 * User verification approval workflow
 * 
 * This function is triggered when an admin approves a user.
 * It performs the following steps:
 * 1. Updates the user's verification status
 * 2. Notifies the user of their approval
 */
export const userApprovalWorkflow = inngest.createFunction(
  { id: "user-approval-workflow" },
  { event: "user/verified" },
  async ({ event, step }) => {
    const { userId, verifiedBy, timestamp, notes } = event.data
    
    // Step 1: Update user profile with approved status
    const updatedProfile = await step.run("update-verification-status", async () => {
      const supabase = createServiceClient()

      const { data, error } = await supabase
        .from("user_profiles")
        .update({
          verification_status: "approved",
          verified_by: verifiedBy,
          verified_at: timestamp,
          verification_notes: notes
        })
        .eq("id", userId)
        .select(`
          first_name,
          last_name,
          display_name
        `)
        .single()

      if (error) {
        throw new Error(`Failed to update user verification status: ${error.message}`)
      }

      // Use a safe type for the profile data
      return data as {
        first_name?: string;
        last_name?: string;
        display_name?: string;
      } | null
    })
    
    // Step 2: Notify the user of their approval
    await step.run("notify-user", async () => {
      const supabase = createServiceClient()

      // Get user email from auth
      const { data: userData } = await supabase.auth.admin.getUserById(userId)
      const userEmail = userData?.user?.email || ""

      if (!userEmail) {
        console.error("Could not find user email for notification")
        return { notified: false }
      }

      // Send an email to the user
      await inngest.send({
        name: "notification/email.send",
        data: {
          to: userEmail,
          subject: "Your Account Has Been Verified",
          template: "user-verification-approved",
          templateData: {
            userName: updatedProfile?.display_name ||
                     `${updatedProfile?.first_name || ""} ${updatedProfile?.last_name || ""}`,
            loginLink: `${process.env.NEXT_PUBLIC_SITE_URL}/login`
          },
          timestamp: new Date().toISOString()
        }
      })
      
      return { notified: true }
    })
    
    // Final step: Return workflow result
    return {
      userId,
      verification: {
        status: "approved",
        verifiedBy,
        timestamp
      }
    }
  }
)

/**
 * User verification rejection workflow
 * 
 * This function is triggered when an admin rejects a user.
 * It performs the following steps:
 * 1. Updates the user's verification status
 * 2. Notifies the user of their rejection
 */
export const userRejectionWorkflow = inngest.createFunction(
  { id: "user-rejection-workflow" },
  { event: "user/rejected" },
  async ({ event, step }) => {
    const { userId, rejectedBy, timestamp, reason } = event.data
    
    // Step 1: Update user profile with rejected status
    const updatedProfile = await step.run("update-verification-status", async () => {
      const supabase = createServiceClient()

      const { data, error } = await supabase
        .from("user_profiles")
        .update({
          verification_status: "rejected",
          verified_by: rejectedBy,
          verified_at: timestamp,
          verification_notes: reason
        })
        .eq("id", userId)
        .select(`
          first_name,
          last_name,
          display_name
        `)
        .single()

      if (error) {
        throw new Error(`Failed to update user verification status: ${error.message}`)
      }

      // Use a safe type for the profile data
      return data as {
        first_name?: string;
        last_name?: string;
        display_name?: string;
      } | null
    })
    
    // Step 2: Notify the user of their rejection
    await step.run("notify-user", async () => {
      const supabase = createServiceClient()

      // Get user email from auth
      const { data: userData } = await supabase.auth.admin.getUserById(userId)
      const userEmail = userData?.user?.email || ""

      if (!userEmail) {
        console.error("Could not find user email for notification")
        return { notified: false }
      }

      // Send an email to the user
      await inngest.send({
        name: "notification/email.send",
        data: {
          to: userEmail,
          subject: "Account Verification Status",
          template: "user-verification-rejected",
          templateData: {
            userName: updatedProfile?.display_name ||
                     `${updatedProfile?.first_name || ""} ${updatedProfile?.last_name || ""}`,
            reason: reason || "Your account verification was declined by the administrator.",
            contactEmail: process.env.SUPPORT_EMAIL || "management@example.com"
          },
          timestamp: new Date().toISOString()
        }
      })
      
      return { notified: true }
    })
    
    // Final step: Return workflow result
    return {
      userId,
      verification: {
        status: "rejected",
        rejectedBy,
        timestamp,
        reason
      }
    }
  }
)

// Export all functions from this module
const workflows = {
  userVerificationWorkflow,
  userApprovalWorkflow,
  userRejectionWorkflow
}

export default workflows