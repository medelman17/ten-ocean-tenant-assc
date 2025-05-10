"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

import { Permission, RoleName } from "@/lib/types/roles"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"

interface WithRoleProps {
  requiredRoles?: RoleName[]
  requiredPermissions?: Permission[]
  fallback?: React.ReactNode
  redirectTo?: string
}

/**
 * HOC to protect routes based on user roles or permissions
 * Note: This is a client component protection only. For proper security,
 * this should be used in addition to server-side middleware protection.
 */
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  options: WithRoleProps = {}
) {
  const {
    requiredRoles = [],
    requiredPermissions = [],
    fallback,
    redirectTo,
  } = options

  // Return a new component that wraps the original component
  return function ProtectedComponent(props: P) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [hasAccess, setHasAccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    useEffect(() => {
      const checkAccess = async () => {
        try {
          const supabase = createClient()
          
          // Check if user is logged in
          const { data: authData } = await supabase.auth.getSession()
          
          if (!authData.session) {
            setError("You must be logged in to access this page")
            setLoading(false)
            
            if (redirectTo) {
              router.push(redirectTo)
            }
            
            return
          }
          
          // If no specific role requirements, allow access
          if (requiredRoles.length === 0 && requiredPermissions.length === 0) {
            setHasAccess(true)
            setLoading(false)
            return
          }
          
          // Check user roles
          const userId = authData.session.user.id
          const { data: userRoles } = await supabase
            .from("user_roles")
            .select(`
              role_id,
              roles (
                name,
                permissions
              )
            `)
            .eq("user_id", userId)
          
          if (!userRoles || userRoles.length === 0) {
            setError("You don't have the required roles to access this page")
            setLoading(false)
            return
          }
          
          // Type assertion for roles
          type UserRoleWithRoles = {
            role_id: string;
            roles: {
              name: string;
              permissions: Record<string, boolean>;
            };
          }

          const typedUserRoles = userRoles as unknown as UserRoleWithRoles[]

          // Check if user has required roles
          const hasRequiredRole = requiredRoles.length === 0 || typedUserRoles.some(
            userRole => userRole.roles && requiredRoles.includes(userRole.roles.name as RoleName)
          )

          // Check if user has required permissions
          const hasRequiredPermission = requiredPermissions.length === 0 || typedUserRoles.some(
            userRole => {
              if (!userRole.roles?.permissions) return false

              return requiredPermissions.some(permission => {
                return userRole.roles.permissions[permission as string] === true
              })
            }
          )
          
          setHasAccess(hasRequiredRole && hasRequiredPermission)
          
          if (!hasRequiredRole || !hasRequiredPermission) {
            setError("You don't have the required permissions to access this page")
            
            if (redirectTo) {
              router.push(redirectTo)
            }
          }
          
          setLoading(false)
        } catch (err) {
          console.error("Error checking role access:", err)
          setError("Failed to check access permissions")
          setLoading(false)
        }
      }
      
      checkAccess()
    }, [router])
    
    // Show loading state
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <Icons.spinner className="h-8 w-8 animate-spin" />
        </div>
      )
    }
    
    // Show error if access is denied
    if (!hasAccess) {
      if (fallback) {
        return <>{fallback}</>
      }
      
      return (
        <Alert variant="destructive" className="my-4">
          <Icons.warning className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>{error || "You don't have permission to access this page"}</AlertDescription>
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push("/dashboard")}
            >
              Return to Dashboard
            </Button>
          </div>
        </Alert>
      )
    }
    
    // Render the protected component
    return <Component {...props} />
  }
}