"use server"

import { createClient } from "@/lib/supabase/server"
import { withRoleAuth } from "@/lib/supabase/auth-middleware"
import { Roles } from "@/lib/types/roles"
import { toCamelCase, toSnakeCase } from "@/lib/utils/case-transforms"
import { revalidatePath } from "next/cache"

export interface FloorCaptainAssignment {
  id: string
  userId: string
  floorNumber: number
  assignedAt: string
  assignedBy: string | null
  user?: {
    firstName: string | null
    lastName: string | null
    email: string
    profilePictureUrl: string | null
  }
}

/**
 * Fetch all floor captain assignments with user details
 */
export async function fetchFloorCaptainAssignments(): Promise<FloorCaptainAssignment[]> {
  // Ensure the user is an admin
  const { user } = await withRoleAuth([Roles.Admin])
  
  const supabase = await createClient()
  
  // Get all floor captain assignments with user details
  const { data, error } = await supabase
    .from("floor_captain_assignments")
    .select(`
      id,
      user_id,
      floor_number,
      assigned_at,
      assigned_by,
      users:user_id (
        email,
        user_profiles:id (
          first_name,
          last_name,
          profile_picture_url
        )
      )
    `)
    .order("floor_number")
  
  if (error) {
    console.error("Error fetching floor captain assignments:", error)
    return []
  }
  
  // Transform data to camelCase and format user details
  return data.map(assignment => {
    // Basic assignment data transformation
    const camelCaseAssignment = toCamelCase(assignment) as any
    
    // Extract user data if available
    let user = undefined
    if (assignment.users) {
      user = {
        email: assignment.users.email,
        firstName: assignment.users.user_profiles?.first_name || null,
        lastName: assignment.users.user_profiles?.last_name || null,
        profilePictureUrl: assignment.users.user_profiles?.profile_picture_url || null
      }
    }
    
    return {
      ...camelCaseAssignment,
      user
    }
  })
}

/**
 * Fetch available floors (floors that exist in the system)
 */
export async function fetchAvailableFloors(): Promise<number[]> {
  // Ensure the user is an admin
  await withRoleAuth([Roles.Admin])
  
  const supabase = await createClient()
  
  // Get distinct floor numbers
  const { data, error } = await supabase
    .from("units")
    .select("floor")
    .order("floor")
  
  if (error) {
    console.error("Error fetching available floors:", error)
    return []
  }
  
  // Extract unique floor numbers
  return [...new Set(data.map(unit => unit.floor))]
}

/**
 * Fetch verified users eligible to be assigned as floor captains
 */
export async function fetchEligibleUsers(): Promise<{
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profilePictureUrl: string | null;
}[]> {
  // Ensure the user is an admin
  await withRoleAuth([Roles.Admin])
  
  const supabase = await createClient()
  
  // Get verified users
  const { data, error } = await supabase
    .from("user_profiles")
    .select(`
      id,
      first_name,
      last_name,
      profile_picture_url,
      verification_status,
      users:id (
        email
      )
    `)
    .eq("verification_status", "approved")
    .eq("residency_status", "current")
    .order("last_name")
  
  if (error) {
    console.error("Error fetching eligible users:", error)
    return []
  }
  
  // Transform data
  return data.map(user => ({
    id: user.id,
    email: user.users?.email || '',
    firstName: user.first_name,
    lastName: user.last_name,
    profilePictureUrl: user.profile_picture_url
  }))
}

/**
 * Assign a user as floor captain for a specific floor
 */
export async function assignFloorCaptain(
  userId: string,
  floorNumber: number
): Promise<{ success: boolean; error?: string; id?: string }> {
  // Ensure the user is an admin
  const { user: adminUser } = await withRoleAuth([Roles.Admin])
  
  if (!userId || !floorNumber) {
    return { success: false, error: "User ID and floor number are required" }
  }
  
  const supabase = await createClient()
  
  // First, check if this user is already a floor captain for this floor
  const { data: existingAssignments } = await supabase
    .from("floor_captain_assignments")
    .select("id")
    .eq("user_id", userId)
    .eq("floor_number", floorNumber)
  
  if (existingAssignments && existingAssignments.length > 0) {
    return { 
      success: true, 
      id: existingAssignments[0].id,
      error: "User is already assigned as floor captain for this floor" 
    }
  }
  
  // Next, assign the floor captain role if they don't already have it
  const { data: existingRoles } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role_id", (subquery) => {
      return subquery
        .from("roles")
        .select("id")
        .eq("name", "FloorCaptain")
        .single()
    })
  
  if (!existingRoles || existingRoles.length === 0) {
    // Get the floor captain role ID
    const { data: floorCaptainRole } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "FloorCaptain")
      .single()
    
    if (floorCaptainRole) {
      // Assign the floor captain role
      await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role_id: floorCaptainRole.id,
          assigned_by: adminUser.id
        })
    }
  }
  
  // Create the floor captain assignment
  const { data, error } = await supabase
    .from("floor_captain_assignments")
    .insert({
      user_id: userId,
      floor_number: floorNumber,
      assigned_by: adminUser.id
    })
    .select("id")
    .single()
  
  if (error) {
    console.error("Error assigning floor captain:", error)
    return { success: false, error: "Failed to assign floor captain" }
  }
  
  // Revalidate related pages
  revalidatePath('/dashboard/admin/floor-captains')
  revalidatePath('/dashboard/floor-captain')
  
  return { success: true, id: data.id }
}

/**
 * Remove a floor captain assignment
 */
export async function removeFloorCaptainAssignment(
  assignmentId: string
): Promise<{ success: boolean; error?: string }> {
  // Ensure the user is an admin
  await withRoleAuth([Roles.Admin])
  
  if (!assignmentId) {
    return { success: false, error: "Assignment ID is required" }
  }
  
  const supabase = await createClient()
  
  // Delete the assignment
  const { error } = await supabase
    .from("floor_captain_assignments")
    .delete()
    .eq("id", assignmentId)
  
  if (error) {
    console.error("Error removing floor captain assignment:", error)
    return { success: false, error: "Failed to remove floor captain assignment" }
  }
  
  // Revalidate related pages
  revalidatePath('/dashboard/admin/floor-captains')
  revalidatePath('/dashboard/floor-captain')
  
  return { success: true }
}