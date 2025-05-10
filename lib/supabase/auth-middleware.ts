import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { getUserRoles, checkUserAccess } from "@/lib/utils/roles"
import { Permission, RoleName } from "@/lib/types/roles"

interface AuthOptions {
  requiredRoles?: RoleName[]
  requiredPermissions?: Permission[]
  redirectTo?: string
}

/**
 * Role-based authentication middleware
 * Checks if the user has the required roles/permissions and redirects if not
 */
export async function withRoleAuth(
  request: NextRequest,
  options: AuthOptions = {}
) {
  const {
    requiredRoles = [],
    requiredPermissions = [],
    redirectTo = "/login"
  } = options

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // Don't create a response here, we'll do that after checking roles
        },
      },
    }
  )

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = redirectTo
    url.searchParams.set("returnUrl", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // If no role/permission requirements, allow access
  if (requiredRoles.length === 0 && requiredPermissions.length === 0) {
    return NextResponse.next()
  }

  // Get user roles and check against requirements
  const userRoles = await getUserRoles(supabase, user.id)
  const accessCheck = checkUserAccess(userRoles, requiredRoles, requiredPermissions)

  // If user has required roles/permissions, allow access
  if (accessCheck.hasRole && accessCheck.hasPermission) {
    return NextResponse.next()
  }

  // Otherwise, redirect to unauthorized page
  const url = request.nextUrl.clone()
  url.pathname = "/error"
  url.searchParams.set("error", "You don't have permission to access this page")
  url.searchParams.set("returnUrl", "/dashboard")
  return NextResponse.redirect(url)
}

/**
 * Helper for admin-only routes
 */
export function adminOnly(request: NextRequest) {
  return withRoleAuth(request, {
    requiredRoles: ["Admin"],
    redirectTo: "/dashboard"
  })
}

/**
 * Helper for floor captain routes
 */
export function floorCaptainOnly(request: NextRequest) {
  return withRoleAuth(request, {
    requiredRoles: ["Admin", "FloorCaptain"],
    redirectTo: "/dashboard"
  })
}

/**
 * Helper for resident routes
 */
export function residentsOnly(request: NextRequest) {
  return withRoleAuth(request, {
    requiredRoles: ["Admin", "FloorCaptain", "Resident"],
    redirectTo: "/dashboard"
  })
}