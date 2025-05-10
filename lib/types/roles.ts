// Define role names to avoid string literals 
export const ROLES = {
  ADMIN: "Admin",
  FLOOR_CAPTAIN: "FloorCaptain",
  RESIDENT: "Resident",
  ALUMNI: "Alumni"
} as const

export type RoleName = (typeof ROLES)[keyof typeof ROLES]

// Permission types
export type Permission = 
  | "can_manage_users" 
  | "can_manage_roles" 
  | "can_manage_content"
  | "can_verify_residents"
  | "can_post_announcements"
  | "can_view_content"
  | "can_participate"
  | "can_view_limited_content"
  | "can_participate_limited"

// Roles with permissions
export interface RoleWithPermissions {
  id: string
  name: RoleName
  permissions: Record<Permission, boolean>
}

// User with roles
export interface UserWithRoles {
  id: string
  roles: RoleWithPermissions[]
  hasRole: (roleName: RoleName) => boolean
  hasPermission: (permission: Permission) => boolean
}

// Role check result 
export interface RoleCheckResult {
  hasRole: boolean
  hasPermission: boolean
  missingRoles: RoleName[]
  missingPermissions: Permission[]
}