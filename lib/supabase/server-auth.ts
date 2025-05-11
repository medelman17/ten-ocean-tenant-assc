import { createClient } from "./server"
import { getUserRoles, checkUserAccess } from "@/lib/utils/roles"
import { RoleName } from "@/lib/types/roles"
import { User } from "@supabase/supabase-js"

interface AuthResult {
  user: User
  profile?: Record<string, unknown>
  roles?: string[]
}

/**
 * Server-side role check for server actions
 * @param requiredRoles Array of required role names
 * @returns Object with user data if authorized
 * @throws Error if user is not authenticated or lacks required roles
 */
export async function checkServerAuth(requiredRoles: RoleName[] = []): Promise<AuthResult> {
  const supabase = await createClient()

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  const user = session.user

  // If no specific roles required, return basic user data
  if (requiredRoles.length === 0) {
    return { user }
  }

  // Check user roles
  const userRoles = await getUserRoles(supabase, user.id)
  const accessCheck = checkUserAccess(userRoles, requiredRoles)

  // If user has the required roles, allow access
  if (accessCheck.hasRole) {
    // Get user profile data if available
    const { data: profileData } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

    return {
      user,
      profile: profileData || undefined,
      roles: userRoles?.roles.map((r) => r.name) || [],
    }
  }

  // Otherwise, throw error
  const missingRolesStr = accessCheck.missingRoles.join(", ")
  throw new Error(`Access denied. Required roles: ${missingRolesStr}`)
}
