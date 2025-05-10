"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Permission, RoleName, ROLES } from "@/lib/types/roles"

interface RoleContextValue {
  userRoles: string[]
  userPermissions: Record<string, boolean>
  isLoading: boolean
  hasRole: (role: RoleName) => boolean
  hasPermission: (permission: Permission) => boolean
  isAdmin: boolean
  isFloorCaptain: boolean
  isResident: boolean
  isAlumni: boolean
}

const RoleContext = createContext<RoleContextValue>({
  userRoles: [],
  userPermissions: {},
  isLoading: true,
  hasRole: () => false,
  hasPermission: () => false,
  isAdmin: false,
  isFloorCaptain: false,
  isResident: false,
  isAlumni: false,
})

export const useRole = () => useContext(RoleContext)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const supabase = createClient()
    
    async function loadUserRoles() {
      try {
        // Check if user is logged in
        const { data: authData } = await supabase.auth.getSession()
        
        if (!authData.session) {
          setIsLoading(false)
          return
        }
        
        // Get user roles
        const { data: userRolesData } = await supabase
          .from("user_roles")
          .select(`
            role_id,
            roles (
              name,
              permissions
            )
          `)
          .eq("user_id", authData.session.user.id)
        
        if (!userRolesData || userRolesData.length === 0) {
          setIsLoading(false)
          return
        }
        
        // Extract role names and permissions
        const roleNames: string[] = []
        const permissions: Record<string, boolean> = {}

        userRolesData.forEach(userRole => {
          // Type assertion for roles
          type UserRoleWithRoles = {
            role_id: string;
            roles: {
              name: string;
              permissions: Record<string, boolean>;
            };
          }

          const typedUserRole = userRole as unknown as UserRoleWithRoles

          if (typedUserRole.roles?.name) {
            roleNames.push(typedUserRole.roles.name)
          }

          if (typedUserRole.roles?.permissions) {
            const rolePermissions = typedUserRole.roles.permissions
            Object.entries(rolePermissions).forEach(([key, value]) => {
              if (value === true) {
                permissions[key] = true
              }
            })
          }
        })
        
        setUserRoles(roleNames)
        setUserPermissions(permissions)
      } catch (error) {
        console.error("Error loading user roles:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    // Load roles when component mounts or auth state changes
    loadUserRoles()
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUserRoles()
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  // Utility functions
  const hasRole = (role: RoleName) => userRoles.includes(role)
  const hasPermission = (permission: Permission) => !!userPermissions[permission]
  
  // Common role checks
  const isAdmin = hasRole(ROLES.ADMIN)
  const isFloorCaptain = hasRole(ROLES.FLOOR_CAPTAIN)
  const isResident = hasRole(ROLES.RESIDENT) 
  const isAlumni = hasRole(ROLES.ALUMNI)
  
  const value = {
    userRoles,
    userPermissions,
    isLoading,
    hasRole,
    hasPermission,
    isAdmin,
    isFloorCaptain,
    isResident,
    isAlumni,
  }
  
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}