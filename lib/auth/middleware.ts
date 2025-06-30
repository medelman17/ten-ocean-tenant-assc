import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getCurrentUser } from "./session"
import { hasPermission, type Permission } from "./permissions"

// Define protected routes and their required permissions
const protectedRoutes: Record<string, Permission | null> = {
  "/dashboard": null, // Any authenticated user
  "/dashboard/admin": "admin:all",
  "/dashboard/floor-captain": "floor_captain:manage_floor",
  "/dashboard/moderator": "moderator:manage_forum",
  "/dashboard/directory": null, // Any authenticated user
}

/**
 * Next.js middleware to handle authentication and authorization
 * Replaces Supabase RLS by checking permissions at the route level
 */
export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route requires protection
  const requiredPermission = getRequiredPermission(pathname)

  if (requiredPermission !== undefined) {
    const user = await getCurrentUser()

    // Redirect to login if not authenticated
    if (!user) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check specific permission if required
    if (requiredPermission && !(await hasPermission(requiredPermission))) {
      return new NextResponse("Forbidden", { status: 403 })
    }
  }

  return NextResponse.next()
}

/**
 * Determine the required permission for a given pathname
 * Returns undefined if route is public, null if any auth is required, or specific permission
 */
function getRequiredPermission(pathname: string): Permission | null | undefined {
  // Exact match first
  if (pathname in protectedRoutes) {
    return protectedRoutes[pathname]
  }

  // Check for parent route matches (e.g., /dashboard/admin/users -> /dashboard/admin)
  const segments = pathname.split("/").filter(Boolean)
  for (let i = segments.length; i > 0; i--) {
    const parentPath = "/" + segments.slice(0, i).join("/")
    if (parentPath in protectedRoutes) {
      return protectedRoutes[parentPath]
    }
  }

  return undefined // Public route
}

/**
 * Utility to check if a route is protected
 */
export function isProtectedRoute(pathname: string): boolean {
  return getRequiredPermission(pathname) !== undefined
}

/**
 * Get user context for server components
 * Use this in server components to get current user with proper permissions
 */
export async function getServerAuthContext() {
  const user = await getCurrentUser()

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user ? await hasPermission("admin:all") : false,
    isModerator: user ? await hasPermission("moderator:manage_forum") : false,
    isFloorCaptain: user ? await hasPermission("floor_captain:manage_floor") : false,
  }
}
