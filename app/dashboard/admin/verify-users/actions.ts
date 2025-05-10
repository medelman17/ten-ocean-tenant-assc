"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { inngest } from "@/lib/inngest/client"

/**
 * Server action to approve a user
 * Triggers the Inngest workflow for user verification
 */
export async function approveUser(formData: FormData) {
  const userId = formData.get("userId") as string
  const notes = formData.get("notes") as string || undefined
  
  if (!userId) {
    return { success: false, error: "User ID is required" }
  }
  
  try {
    // Get current user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: "You must be logged in to approve users" }
    }
    
    // Trigger the user verification workflow
    await inngest.send({
      name: "user/verified",
      data: {
        userId,
        verifiedBy: user.id,
        timestamp: new Date().toISOString(),
        notes
      }
    })
    
    // Revalidate the page to show updated data
    revalidatePath("/dashboard/admin/verify-users")
    
    return {
      success: true,
      message: "User approved successfully"
    }
  } catch (error) {
    console.error("Error approving user:", error)
    return {
      success: false,
      error: "Failed to approve user"
    }
  }
}

/**
 * Server action to reject a user
 * Triggers the Inngest workflow for user rejection
 */
export async function rejectUser(formData: FormData) {
  const userId = formData.get("userId") as string
  const reason = formData.get("reason") as string || undefined
  
  if (!userId) {
    return { success: false, error: "User ID is required" }
  }
  
  try {
    // Get current user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: "You must be logged in to reject users" }
    }
    
    // Trigger the user rejection workflow
    await inngest.send({
      name: "user/rejected",
      data: {
        userId,
        rejectedBy: user.id,
        timestamp: new Date().toISOString(),
        reason
      }
    })
    
    // Revalidate the page to show updated data
    revalidatePath("/dashboard/admin/verify-users")
    
    return {
      success: true,
      message: "User rejected successfully"
    }
  } catch (error) {
    console.error("Error rejecting user:", error)
    return {
      success: false,
      error: "Failed to reject user"
    }
  }
}