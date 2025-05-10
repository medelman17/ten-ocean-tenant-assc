import { SupabaseClient } from "@supabase/supabase-js"
import { Database } from "@/types/supabase"
import { 
  Permission, 
  RoleName, 
  RoleWithPermissions, 
  UserWithRoles, 
  RoleCheckResult,
  ROLES
} from "@/lib/types/roles"

/**
 * Fetches and formats user roles with permissions
 * @param supabase The Supabase client
 * @param userId The user ID to fetch roles for
 * @returns A UserWithRoles object or null if no user is found
 */
export async function getUserRoles(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserWithRoles | null> {
  if (!userId) return null

  // Fetch user roles with permissions
  const { data: userRoles, error } = await supabase
    .from("user_roles")
    .select(`
      role_id,
      roles (
        id,
        name,
        permissions
      )
    `)
    .eq("user_id", userId)

  if (error || !userRoles || userRoles.length === 0) {
    console.error("Error fetching user roles:", error)
    return null
  }

  // Format roles with typed permissions
  const roles = userRoles.map((userRole) => {
    // Ensure roles property exists
    if (!userRole.roles) return null
    
    const role = userRole.roles as unknown as {
      id: string
      name: string
      permissions: Record<string, boolean>
    }

    return {
      id: role.id,
      name: role.name as RoleName,
      permissions: role.permissions as Record<Permission, boolean>
    } satisfies RoleWithPermissions
  }).filter(Boolean) as RoleWithPermissions[]

  // Create user with roles object with helper methods
  const userWithRoles: UserWithRoles = {
    id: userId,
    roles,
    hasRole: (roleName: RoleName) => roles.some(role => role.name === roleName),
    hasPermission: (permission: Permission) => 
      roles.some(role => role.permissions[permission] === true)
  }

  return userWithRoles
}

/**
 * Checks if a user has the required roles and permissions
 * @param userRoles The user's roles object
 * @param requiredRoles Array of required role names (any match is sufficient)
 * @param requiredPermissions Array of required permissions (any match is sufficient)
 * @returns A RoleCheckResult object
 */
export function checkUserAccess(
  userRoles: UserWithRoles | null,
  requiredRoles: RoleName[] = [],
  requiredPermissions: Permission[] = []
): RoleCheckResult {
  // If no user roles, access is denied
  if (!userRoles) {
    return {
      hasRole: false,
      hasPermission: false,
      missingRoles: requiredRoles,
      missingPermissions: requiredPermissions
    }
  }

  // If no specific requirements, access is granted
  const requiresSpecificRole = requiredRoles.length > 0
  const requiresSpecificPermission = requiredPermissions.length > 0

  // Check roles
  const hasRequiredRole = !requiresSpecificRole || 
    requiredRoles.some(role => userRoles.hasRole(role))

  // Check permissions
  const hasRequiredPermission = !requiresSpecificPermission || 
    requiredPermissions.some(permission => userRoles.hasPermission(permission))

  // Calculate missing roles and permissions for detailed feedback
  const missingRoles = requiredRoles.filter(role => !userRoles.hasRole(role))
  const missingPermissions = requiredPermissions.filter(
    permission => !userRoles.hasPermission(permission)
  )

  return {
    hasRole: hasRequiredRole,
    hasPermission: hasRequiredPermission,
    missingRoles,
    missingPermissions
  }
}

/**
 * Utility to get role names for display
 * @param roleNames Array of role names
 * @returns Formatted string of role names
 */
export function formatRoleNames(roleNames: RoleName[]): string {
  if (roleNames.length === 0) return ""
  if (roleNames.length === 1) return roleNames[0]
  
  const lastRole = roleNames.pop()
  return `${roleNames.join(", ")} or ${lastRole}`
}

/**
 * Checks if the given user is an Admin
 */
export function isAdmin(userRoles: UserWithRoles | null): boolean {
  return userRoles?.hasRole(ROLES.ADMIN) || false
}

/**
 * Checks if the given user is a Floor Captain
 */
export function isFloorCaptain(userRoles: UserWithRoles | null): boolean {
  return userRoles?.hasRole(ROLES.FLOOR_CAPTAIN) || false
}