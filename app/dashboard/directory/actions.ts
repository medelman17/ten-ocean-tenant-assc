"use server"

import { createClient } from "@/lib/supabase/server"
import { checkServerAuth } from "@/lib/supabase/server-auth"
import { ROLES } from "@/lib/types/roles"
import { ResidentProfile } from "@/lib/types/directory"

/**
 * Fetch all verified residents for the building directory
 * Only accessible to verified users
 */
export async function fetchVerifiedResidents(): Promise<ResidentProfile[]> {
  // Verify user is authenticated and has appropriate role
  const { profile } = await checkServerAuth([ROLES.RESIDENT, ROLES.ADMIN, ROLES.FLOOR_CAPTAIN])

  // Check if user is verified
  if (profile?.verification_status !== "approved") {
    throw new Error("Only verified residents can access the directory")
  }

  const supabase = await createClient()

  // Fetch verified residents with their unit and skill information
  const { data, error } = await supabase
    .from("user_profiles")
    .select(
      `
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
    `
    )
    .eq("verification_status", "approved")
    .eq("residency_status", "current")
    .not("profile_visibility", "eq", "private")

  if (error) {
    console.error("Error fetching residents:", error)
    throw new Error("Failed to fetch residents")
  }

  // Transform data to camelCase and format for our components
  const formattedResidents = data.map((resident): ResidentProfile => {
    // Convert snake_case to camelCase for all fields
    // We're using specific properties directly, so we don't need camelCaseResident

    // Extract and format user skills
    const userSkills = resident.user_skills?.[0] || null
    const skills = userSkills?.skills || null
    const interests = userSkills?.interests || null
    const communityInvolvement = userSkills?.community_involvement || null

    // Format unit information
    const unit = resident.units
      ? {
          id: (resident.units as unknown as { id: string }).id,
          unitNumber: (resident.units as unknown as { unit_number: string }).unit_number,
          floor: (resident.units as unknown as { floor: number }).floor,
        }
      : null

    // Cast entire resident to any to avoid property access errors
    const residentAny = resident as unknown as {
      users?: { email: string }
      verification_status?: string
      created_at?: string
      last_login?: string
    }

    return {
      id: resident.id,
      firstName: resident.first_name,
      lastName: resident.last_name,
      displayName: resident.display_name || `${resident.first_name || ""} ${resident.last_name || ""}`.trim(),
      email: residentAny.users?.email || "",
      profilePictureUrl: resident.profile_picture_url,
      verificationStatus: residentAny.verification_status || "pending",
      residencyStatus: resident.residency_status,
      joinedDate: residentAny.created_at || null,
      lastActive: residentAny.last_login || null,
      bio: resident.bio || null,
      phone: resident.phone || null,
      occupation: resident.occupation || null,
      moveInDate: resident.move_in_date || null,
      languagesSpoken: resident.languages_spoken || null,
      socialMediaLinks: resident.social_media_links || null,
      unit,
      skills: skills || [],
      interests: interests || [],
      communityInvolvement: communityInvolvement || [],
    } as ResidentProfile
  })

  return formattedResidents
}

/**
 * Fetch all floor numbers that have verified residents
 */
export async function fetchAvailableFloors(): Promise<number[]> {
  // Verify user is authenticated and has appropriate role
  const { profile } = await checkServerAuth([ROLES.RESIDENT, ROLES.ADMIN, ROLES.FLOOR_CAPTAIN])

  // Check if user is verified
  if (profile?.verification_status !== "approved") {
    throw new Error("Only verified residents can access the directory")
  }

  const supabase = await createClient()

  // Fetch distinct floors occupied by verified residents
  const { data, error } = await supabase
    .from("units")
    .select("floor")
    .filter(
      "id",
      "in",
      (subquery: {
        from: (table: string) => {
          select: (column: string) => {
            eq: (
              column: string,
              value: string
            ) => {
              eq: (
                column: string,
                value: string
              ) => {
                not: (column: string, op: string, value: string) => unknown
              }
            }
          }
        }
      }) => {
        return subquery.from("user_profiles").select("unit_id").eq("verification_status", "approved").eq("residency_status", "current").not("profile_visibility", "eq", "private")
      }
    )
    .order("floor", { ascending: true })

  if (error) {
    console.error("Error fetching floors:", error)
    throw new Error("Failed to fetch floors")
  }

  // Extract unique floor numbers
  const floorNumbers = [...new Set(data.map((item) => item.floor))]

  return floorNumbers
}
