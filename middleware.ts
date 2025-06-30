import { NextResponse, type NextRequest } from "next/server"
import { authMiddleware } from "@/lib/auth/middleware"

export async function middleware(request: NextRequest) {
  // Skip authentication check for the home route
  if (request.nextUrl.pathname === "/") {
    return NextResponse.next()
  }

  // Skip authentication for Inngest webhook routes
  if (request.nextUrl.pathname.startsWith("/api/inngest")) {
    return NextResponse.next()
  }

  // Skip authentication for auth-related API routes
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Skip authentication for public API routes (if any)
  if (request.nextUrl.pathname.startsWith("/api/public")) {
    return NextResponse.next()
  }

  // Use our new authentication middleware for all other routes
  return await authMiddleware(request)
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
