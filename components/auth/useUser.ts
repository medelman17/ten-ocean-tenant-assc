"use client"

import { useEffect, useState } from "react"
import type { AuthUser } from "@/lib/auth/session"
import type { Permission } from "@/lib/auth/permissions"

interface UseUserReturn {
  user: AuthUser | null
  isLoading: boolean
  error: Error | null
  hasPermission: (permission: Permission) => boolean
  refetch: () => Promise<void>
}

/**
 * Client-side hook for user authentication and permissions
 * Replaces Supabase's useUser() hook with our custom auth system
 *
 * Usage:
 * const { user, isLoading, hasPermission } = useUser();
 * if (hasPermission('admin:all')) { ... }
 */
export function useUser(): UseUserReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchUser = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Call our auth API endpoint
      const response = await fetch("/api/auth/user", {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user || null)
      } else if (response.status === 401) {
        // User not authenticated
        setUser(null)
      } else {
        throw new Error("Failed to fetch user data")
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"))
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false

    // Basic permission checks based on user roles
    switch (permission) {
      case "admin:all":
        return user.roles.some((role) => role.name === "Admin")

      case "moderator:view_all_profiles":
      case "moderator:manage_forum":
        return user.roles.some((role) => role.name === "Admin" || role.name === "Moderator")

      case "floor_captain:view_floor_residents":
      case "floor_captain:manage_floor":
        return user.roles.some((role) => role.name === "Admin" || role.name === "Moderator" || role.name === "Floor Captain")

      case "user:view_own_profile":
      case "user:update_own_profile":
        return !!user.profile

      case "public:view_announcements":
      case "public:view_events":
        return true // All authenticated users

      default:
        return false
    }
  }

  return {
    user,
    isLoading,
    error,
    hasPermission,
    refetch: fetchUser,
  }
}
