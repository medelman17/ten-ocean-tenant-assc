import { prisma } from "@/lib/prisma"
import { getCurrentUser, type AuthUser } from "./session"

// Permission types matching our RLS policies
export type Permission =
  | "admin:all"
  | "user:view_own_profile"
  | "user:update_own_profile"
  | "moderator:view_all_profiles"
  | "moderator:manage_forum"
  | "floor_captain:view_floor_residents"
  | "floor_captain:manage_floor"
  | "public:view_announcements"
  | "public:view_events"

/**
 * Check if a user has admin privileges
 * Replaces: EXISTS (SELECT 1 FROM user_roles JOIN roles WHERE roles.name = 'Admin')
 */
export async function isAdmin(user: AuthUser): Promise<boolean> {
  return user.roles.some((role) => role.name === "Admin")
}

/**
 * Check if a user has moderator privileges
 * Replaces: EXISTS (SELECT 1 FROM user_roles JOIN roles WHERE roles.name = 'Moderator')
 */
export async function isModerator(user: AuthUser): Promise<boolean> {
  return user.roles.some((role) => role.name === "Moderator")
}

/**
 * Check if a user has floor captain privileges
 * Replaces: EXISTS (SELECT 1 FROM user_roles JOIN roles WHERE roles.name = 'Floor Captain')
 */
export async function isFloorCaptain(user: AuthUser): Promise<boolean> {
  return user.roles.some((role) => role.name === "Floor Captain")
}

/**
 * Check if a user can view a specific profile
 * Replaces: Supabase RLS policy "Admins can view all profiles" + "Users can view own profile"
 */
export async function canViewProfile(profileId: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  // Admins can view all profiles
  if (await isAdmin(user)) return true

  // Users can view their own profile
  return user.profile?.id === profileId
}

/**
 * Check if a user can update a specific profile
 * Replaces: Supabase RLS policy "Users can update own profile"
 */
export async function canUpdateProfile(profileId: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  // Admins can update any profile
  if (await isAdmin(user)) return true

  // Users can only update their own profile
  return user.profile?.id === profileId
}

/**
 * Check if a user can view forum content
 * Replaces: Supabase RLS policy for forum access
 */
export async function canViewForum(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user // All authenticated users can view forum
}

/**
 * Check if a user can create forum posts
 * Replaces: Supabase RLS policy for forum posting
 */
export async function canCreateForumPost(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  // All authenticated users with verified profiles can post
  return user.profile?.verificationStatus === "VERIFIED"
}

/**
 * Check if a user can moderate forum content
 * Replaces: Supabase RLS policy for forum moderation
 */
export async function canModerateForum(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  return (await isAdmin(user)) || (await isModerator(user))
}

/**
 * Check if a user can view residents on a specific floor
 * Replaces: Supabase RLS policy for floor captain access
 */
export async function canViewFloorResidents(floorNumber: number): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  // Admins can view all floors
  if (await isAdmin(user)) return true

  // Floor captains can view their assigned floor
  if (await isFloorCaptain(user)) {
    // Check if user is assigned to this floor
    const assignment = await prisma.floorCaptainAssignment.findFirst({
      where: {
        userId: user.id,
        floorNumber: floorNumber,
      },
    })
    return !!assignment
  }

  return false
}

/**
 * Check if a user can create announcements
 * Replaces: Supabase RLS policy for announcement creation
 */
export async function canCreateAnnouncement(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  return (await isAdmin(user)) || (await isModerator(user)) || (await isFloorCaptain(user))
}

/**
 * Check if a user can view all announcements
 * Public access - all authenticated users
 */
export async function canViewAnnouncements(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Check if a user can create events
 * Replaces: Supabase RLS policy for event creation
 */
export async function canCreateEvent(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  return (await isAdmin(user)) || (await isModerator(user))
}

/**
 * Check if a user can view events
 * Public access - all authenticated users
 */
export async function canViewEvents(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Check if a user can manage maintenance requests
 * Replaces: Supabase RLS policy for maintenance management
 */
export async function canManageMaintenance(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  return await isAdmin(user)
}

/**
 * Check if a user can view their own maintenance requests
 * Replaces: Supabase RLS policy for maintenance viewing
 */
export async function canViewOwnMaintenance(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Generic permission checker for complex permissions
 * Use this for future permission requirements
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  switch (permission) {
    case "admin:all":
      return await isAdmin(user)
    case "moderator:view_all_profiles":
      return (await isAdmin(user)) || (await isModerator(user))
    case "moderator:manage_forum":
      return await canModerateForum()
    case "user:view_own_profile":
    case "user:update_own_profile":
      return !!user.profile
    case "floor_captain:view_floor_residents":
      return await isFloorCaptain(user)
    case "floor_captain:manage_floor":
      return await isFloorCaptain(user)
    case "public:view_announcements":
      return await canViewAnnouncements()
    case "public:view_events":
      return await canViewEvents()
    default:
      return false
  }
}

/**
 * Higher-order function to protect API routes
 * Usage: export const GET = withAuth(async (request, { user }) => { ... })
 */
export function withAuth<T extends unknown[]>(handler: (request: Request, context: { user: AuthUser }, ...args: T) => Promise<Response>) {
  return async (request: Request, ...args: T): Promise<Response> => {
    const user = await getCurrentUser()

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    return handler(request, { user }, ...args)
  }
}

/**
 * Higher-order function to protect API routes with specific permissions
 * Usage: export const GET = withPermission('admin:all', async (request, { user }) => { ... })
 */
export function withPermission<T extends unknown[]>(permission: Permission, handler: (request: Request, context: { user: AuthUser }, ...args: T) => Promise<Response>) {
  return async (request: Request, ...args: T): Promise<Response> => {
    const user = await getCurrentUser()

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const hasPermissionResult = await hasPermission(permission)
    if (!hasPermissionResult) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    }

    return handler(request, { user }, ...args)
  }
}
