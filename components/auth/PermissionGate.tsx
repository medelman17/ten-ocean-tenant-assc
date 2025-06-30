"use client"

import { ReactNode } from "react"
import { useUser } from "./useUser" // To be created
import type { Permission } from "@/lib/auth/permissions"

interface PermissionGateProps {
  permission?: Permission
  requireAuth?: boolean
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Permission gate component for conditional rendering based on user permissions
 * Replaces Supabase RLS by controlling what UI elements users can see
 *
 * Usage:
 * <PermissionGate permission="admin:all">
 *   <AdminOnlyContent />
 * </PermissionGate>
 */
export function PermissionGate({ permission, requireAuth = false, children, fallback = null }: PermissionGateProps) {
  const { user, isLoading, hasPermission } = useUser()

  // Show loading state
  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>
  }

  // Check authentication requirement
  if (requireAuth && !user) {
    return <>{fallback}</>
  }

  // Check specific permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Admin-only wrapper component
 */
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate permission="admin:all" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

/**
 * Moderator-only wrapper component
 */
export function ModeratorOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate permission="moderator:manage_forum" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

/**
 * Floor Captain-only wrapper component
 */
export function FloorCaptainOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate permission="floor_captain:manage_floor" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

/**
 * Authenticated users only wrapper component
 */
export function AuthenticatedOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate requireAuth fallback={fallback}>
      {children}
    </PermissionGate>
  )
}
