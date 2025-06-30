import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"

/**
 * GET /api/auth/user
 * Returns current authenticated user data for client-side components
 * Replaces Supabase's client-side user fetching
 */
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ user: null, message: "Not authenticated" }, { status: 401 })
    }

    // Return user data (exclude sensitive information)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile
          ? {
              id: user.profile.id,
              firstName: user.profile.firstName,
              lastName: user.profile.lastName,
              displayName: user.profile.displayName,
              verificationStatus: user.profile.verificationStatus,
              profilePictureUrl: user.profile.profilePictureUrl,
              residencyStatus: user.profile.residencyStatus,
              unitId: user.profile.unitId,
            }
          : null,
        roles: user.roles.map((role) => ({
          id: role.id,
          name: role.name,
          description: role.description,
        })),
      },
    })
  } catch (error) {
    console.error("Auth API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
