import { cookies } from "next/headers"
import { cache } from "react"
import { prisma } from "@/lib/prisma"
import type { UserProfile, Role } from "@/lib/generated/prisma"

// Types for our auth system
export interface AuthUser {
  id: string
  email: string
  profile?: UserProfile
  roles: Role[]
}

export interface SessionData {
  userId: string
  email: string
  expiresAt: number
}

/**
 * Get the current authenticated user from session
 * Replaces Supabase auth.uid() functionality
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  try {
    // Get session from cookies (will be implemented with your chosen auth solution)
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")
    if (!sessionCookie?.value) {
      return null
    }

    // Parse session data (in production, this would be a JWT or encrypted token)
    const sessionData: SessionData = JSON.parse(sessionCookie.value)

    // Check if session is expired
    if (Date.now() > sessionData.expiresAt) {
      return null
    }

    // Fetch user with profile and roles from database
    const user = await prisma.userProfile.findUnique({
      where: { id: sessionData.userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: sessionData.email,
      profile: user,
      roles: user.userRoles.map((ur) => ur.role),
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
})

/**
 * Require authentication - throws if user not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

/**
 * Get user roles by user ID
 */
export async function getUserRoles(userId: string): Promise<Role[]> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true },
  })

  return userRoles.map((ur) => ur.role)
}

/**
 * Check if user has Admin role
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const adminRole = await prisma.userRole.findFirst({
    where: {
      userId,
      role: {
        name: "Admin",
      },
    },
  })

  return !!adminRole
}

/**
 * Check if user has FloorCaptain role
 */
export async function isFloorCaptain(userId: string): Promise<boolean> {
  const floorCaptainRole = await prisma.userRole.findFirst({
    where: {
      userId,
      role: {
        name: "FloorCaptain",
      },
    },
  })

  return !!floorCaptainRole
}

/**
 * Check if user has specific role
 */
export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  const userRole = await prisma.userRole.findFirst({
    where: {
      userId,
      role: {
        name: roleName,
      },
    },
  })

  return !!userRole
}

/**
 * Get user's floor captain assignments
 */
export async function getFloorCaptainAssignments(userId: string): Promise<number[]> {
  const assignments = await prisma.floorCaptainAssignment.findMany({
    where: { userId },
    select: { floorNumber: true },
  })

  return assignments.map((a) => a.floorNumber)
}

/**
 * Get user's verification status
 */
export async function getUserVerificationStatus(userId: string): Promise<string | null> {
  const user = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { verificationStatus: true },
  })

  return user?.verificationStatus || null
}

/**
 * Check if user is verified (approved)
 */
export async function isVerifiedUser(userId: string): Promise<boolean> {
  const status = await getUserVerificationStatus(userId)
  return status === "approved"
}
