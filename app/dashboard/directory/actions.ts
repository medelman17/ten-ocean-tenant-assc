"use server"

import { createClient } from "@/lib/supabase/server"
import { withRoleAuth } from "@/lib/supabase/auth-middleware"
import { Roles } from "@/lib/types/roles"
import { ResidentProfile } from "@/lib/types/directory"
import { toCamelCase } from "@/lib/utils/case-transforms"

/**
 * Fetch all verified residents for the building directory
 * Only accessible to verified users
 */
export async function fetchVerifiedResidents(): Promise<ResidentProfile[]> {
  // Verify user is authenticated and has appropriate role
  const { profile } = await withRoleAuth([Roles.Resident, Roles.Admin, Roles.FloorCaptain])
  
  // Check if user is verified
  if (profile?.verification_status !== 'approved') {
    throw new Error("Only verified residents can access the directory")
  }
  
  const supabase = await createClient()
  
  // Fetch verified residents with their unit and skill information
  const { data, error } = await supabase
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
    .eq("verification_status", "approved")
    .eq("residency_status", "current")
    .not("profile_visibility", "eq", "private")
  
  if (error) {
    console.error("Error fetching residents:", error)
    throw new Error("Failed to fetch residents")
  }
  
  // Transform data to camelCase and format for our components
  const formattedResidents = data.map(resident => {
    // Convert snake_case to camelCase for all fields
    const camelCaseResident = toCamelCase(resident) as Record<string, unknown>
    
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
 * Fetch all floor numbers that have verified residents
 */
export async function fetchAvailableFloors(): Promise<number[]> {
  // Verify user is authenticated and has appropriate role
  const { profile } = await withRoleAuth([Roles.Resident, Roles.Admin, Roles.FloorCaptain])
  
  // Check if user is verified
  if (profile?.verification_status !== 'approved') {
    throw new Error("Only verified residents can access the directory")
  }
  
  const supabase = await createClient()
  
  // Fetch distinct floors occupied by verified residents
  const { data, error } = await supabase
    .from("units")
    .select("floor")
    .filter("id", "in", (subquery) => {
      return subquery
        .from("user_profiles")
        .select("unit_id")
        .eq("verification_status", "approved")
        .eq("residency_status", "current")
        .not("profile_visibility", "eq", "private")
    })
    .order("floor", { ascending: true })
  
  if (error) {
    console.error("Error fetching floors:", error)
    throw new Error("Failed to fetch floors")
  }
  
  // Extract unique floor numbers
  const floorNumbers = [...new Set(data.map(item => item.floor))]
  
  return floorNumbers
}