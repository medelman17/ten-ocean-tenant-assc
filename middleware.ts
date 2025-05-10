import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { adminOnly, floorCaptainOnly } from "@/lib/supabase/auth-middleware"

export async function middleware(request: NextRequest) {
  // Skip authentication check for the home route
  if (request.nextUrl.pathname === "/") {
    return NextResponse.next()
  }

  // Admin-only routes
  if (request.nextUrl.pathname.startsWith("/dashboard/admin")) {
    return await adminOnly(request)
  }

  // Floor captain routes
  if (request.nextUrl.pathname.startsWith("/dashboard/captain")) {
    return await floorCaptainOnly(request)
  }

  // Default session check for all other routes
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
