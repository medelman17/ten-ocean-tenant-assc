/**
 * Re-exports Supabase generated types for easier use in components
 */
import { Database } from "@/types/supabase"

// Database row types
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"]
export type Unit = Database["public"]["Tables"]["units"]["Row"]
export type Role = Database["public"]["Tables"]["roles"]["Row"]
export type UserRole = Database["public"]["Tables"]["user_roles"]["Row"] & {
  roles?: Role
}
export type FloorCaptainAssignment = Database["public"]["Tables"]["floor_captain_assignments"]["Row"] & {
  user_profiles?: UserProfile
}

// Define UserProfileWithUnit type for joins
export type UserProfileWithUnit = UserProfile & {
  units?: Unit | null
}

// Define RoleWithName type for joins
export type UserRoleWithName = {
  user_id: string
  role_id: string
  roles: {
    name: string
  }
}