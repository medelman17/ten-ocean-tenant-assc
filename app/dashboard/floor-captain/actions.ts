"use server"

import { createClient } from "@/lib/supabase/server"
import { withRoleAuth } from "@/lib/supabase/auth-middleware"
import { Roles } from "@/lib/types/roles"
import { toCamelCase } from "@/lib/utils/case-transforms"
import { revalidatePath } from "next/cache"
import { ResidentProfile } from "@/lib/types/directory"

export interface FloorAssignment {
  id: string
  userId: string
  floorNumber: number
  assignedAt: string
  assignedBy: string | null
}

interface FloorInfo {
  floorNumber: number
  unitCount: number
  residentCount: number
}

interface FloorAnnouncement {
  id: string
  title: string
  content: string
  createdAt: string
  createdBy: {
    id: string
    displayName?: string
    firstName?: string
    lastName?: string
  }
  isPinned: boolean
  expiresAt: string | null
}

/**
 * Fetch floors assigned to the current floor captain
 */
export async function fetchAssignedFloors(): Promise<FloorAssignment[]> {
  const { user } = await withRoleAuth([Roles.FloorCaptain, Roles.Admin])
  
  const supabase = await createClient()
  
  // If user is admin, let them see all floors
  if (user.roles?.includes(Roles.Admin)) {
    const { data: floorNumbers } = await supabase
      .from("units")
      .select("floor")
      .order("floor")
    
    if (!floorNumbers) return []
    
    // Deduplicate floor numbers
    const uniqueFloors = [...new Set(floorNumbers.map(f => f.floor))];
    
    // Create virtual floor assignments for admin
    return uniqueFloors.map(floorNumber => ({
      id: `admin-floor-${floorNumber}`,
      userId: user.id,
      floorNumber,
      assignedAt: new Date().toISOString(),
      assignedBy: null
    }))
  }
  
  // For normal floor captains, get their assigned floors
  const { data: assignments, error } = await supabase
    .from("floor_captain_assignments")
    .select("*")
    .eq("user_id", user.id)
    .order("floor_number")
  
  if (error) {
    console.error("Error fetching floor assignments:", error)
    return []
  }
  
  return assignments.map(assignment => toCamelCase(assignment)) as FloorAssignment[]
}

/**
 * Fetch information about a specific floor
 */
export async function fetchFloorInfo(floorNumber: number): Promise<FloorInfo | null> {
  await withRoleAuth([Roles.FloorCaptain, Roles.Admin])
  
  const supabase = await createClient()
  
  // Get all units on this floor
  const { data: units, error: unitsError } = await supabase
    .from("units")
    .select("id")
    .eq("floor", floorNumber)
  
  if (unitsError) {
    console.error("Error fetching units:", unitsError)
    return null
  }
  
  // Count residents living on this floor
  const unitIds = units.map(unit => unit.id)
  
  const { count: residentCount, error: residentError } = await supabase
    .from("user_profiles")
    .select("id", { count: 'exact', head: true })
    .in("unit_id", unitIds)
    .eq("verification_status", "approved")
    .eq("residency_status", "current")
  
  if (residentError) {
    console.error("Error counting residents:", residentError)
    return null
  }
  
  return {
    floorNumber,
    unitCount: units.length,
    residentCount: residentCount || 0
  }
}

/**
 * Fetch residents for a specific floor
 */
export async function fetchFloorResidents(floorNumber: number): Promise<ResidentProfile[]> {
  await withRoleAuth([Roles.FloorCaptain, Roles.Admin])
  
  const supabase = await createClient()
  
  // Get all units on this floor
  const { data: units, error: unitsError } = await supabase
    .from("units")
    .select("id")
    .eq("floor", floorNumber)
  
  if (unitsError || !units.length) {
    console.error("Error fetching units:", unitsError)
    return []
  }
  
  // Get all residents in these units
  const unitIds = units.map(unit => unit.id)
  
  const { data: residents, error: residentsError } = await supabase
    .from("user_profiles")
    .select(`
      id,
      first_name,
      last_name,
      display_name,
      bio,
      phone,
      profile_picture_url,
      occupation,
      move_in_date,
      residency_status,
      languages_spoken,
      social_media_links,
      unit_id,
      units:unit_id (
        id,
        unit_number,
        floor
      ),
      user_skills:id (
        skills,
        interests,
        community_involvement
      )
    `)
    .in("unit_id", unitIds)
    .order("last_name")
  
  if (residentsError) {
    console.error("Error fetching residents:", residentsError)
    return []
  }
  
  // Transform data to camelCase and format for our components
  const formattedResidents = residents.map(resident => {
    // Convert snake_case to camelCase for all fields
    const camelCaseResident = toCamelCase(resident) as any
    
    // Extract and format user skills
    const userSkills = resident.user_skills?.[0] || null
    const skills = userSkills?.skills || null
    const interests = userSkills?.interests || null 
    const communityInvolvement = userSkills?.community_involvement || null
    
    // Format unit information
    const unit = resident.units 
      ? {
          id: resident.units.id,
          unitNumber: resident.units.unit_number,
          floor: resident.units.floor
        }
      : null
    
    return {
      ...camelCaseResident,
      unit,
      skills,
      interests,
      communityInvolvement
    }
  })
  
  return formattedResidents
}

/**
 * Fetch announcements for a specific floor
 */
export async function fetchFloorAnnouncements(floorNumber: number): Promise<FloorAnnouncement[]> {
  await withRoleAuth([Roles.FloorCaptain, Roles.Admin])
  
  const supabase = await createClient()
  
  // Get announcements targeted at this floor
  const { data: announcements, error } = await supabase
    .from("announcements")
    .select(`
      id,
      title,
      content,
      created_at,
      created_by,
      user_profiles:created_by (
        id,
        display_name,
        first_name,
        last_name
      ),
      is_pinned,
      expires_at
    `)
    .eq("target_floor", floorNumber)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
  
  if (error) {
    console.error("Error fetching announcements:", error)
    return []
  }
  
  // Transform the announcements data
  return announcements.map(announcement => ({
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    createdAt: announcement.created_at,
    createdBy: {
      id: announcement.created_by,
      displayName: announcement.user_profiles?.display_name,
      firstName: announcement.user_profiles?.first_name,
      lastName: announcement.user_profiles?.last_name
    },
    isPinned: announcement.is_pinned || false,
    expiresAt: announcement.expires_at
  }))
}

/**
 * Create a new floor announcement
 */
export async function createFloorAnnouncement(
  formData: FormData | Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  const { user } = await withRoleAuth([Roles.FloorCaptain, Roles.Admin])
  
  // Get form values
  const data = formData instanceof FormData ? Object.fromEntries(formData.entries()) : formData
  const { floorNumber, title, content, isPinned, expiresAt } = data
  
  if (!floorNumber || !title || !content) {
    return { success: false, error: "Missing required fields" }
  }
  
  const supabase = await createClient()
  
  // Insert the announcement
  const { error } = await supabase
    .from("announcements")
    .insert({
      title,
      content,
      created_by: user.id,
      target_floor: Number(floorNumber),
      is_pinned: isPinned === "true",
      expires_at: expiresAt || null
    })
  
  if (error) {
    console.error("Error creating announcement:", error)
    return { success: false, error: "Failed to create announcement" }
  }
  
  // Revalidate the page to show the new announcement
  revalidatePath(`/dashboard/floor-captain`)
  
  return { success: true }
}

/**
 * Send a message to all residents on a floor
 */
export async function contactFloorResidents(
  floorNumber: number,
  subject: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  await withRoleAuth([Roles.FloorCaptain, Roles.Admin])
  
  // In a real implementation, this would trigger an email to all residents on the floor
  // For now, we'll just log it and return success
  console.log(`Message to Floor ${floorNumber}: ${subject}\n${message}`)
  
  // Here you would typically integrate with Inngest to queue emails to residents
  
  return { success: true }
}