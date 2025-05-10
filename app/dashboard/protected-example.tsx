"use client"

import React from "react"
import { useRole } from "@/lib/components/role-provider"
import { withRole } from "@/lib/components/with-role"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// This is a protected component - the withRole HOC will handle access control
function ProtectedExample() {
  // Use the useRole hook to access role information
  const { 
    userRoles, 
    userPermissions,
    isAdmin, 
    isFloorCaptain,
    hasPermission
  } = useRole()
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Protected Component Example</CardTitle>
          <CardDescription>
            This component demonstrates role-based access control
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Your Roles</h3>
            <div className="flex flex-wrap gap-2">
              {userRoles.length > 0 ? (
                userRoles.map((role) => (
                  <Badge key={role} variant="outline">
                    {role}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">No roles assigned</p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Your Permissions</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(userPermissions).length > 0 ? (
                Object.keys(userPermissions).map((permission) => (
                  <Badge key={permission} variant="secondary">
                    {permission}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">No permissions assigned</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-md p-4">
              <h3 className="font-medium">Admin Features</h3>
              {isAdmin ? (
                <p className="text-green-600">You have access to admin features</p>
              ) : (
                <p className="text-red-600">Admin access restricted</p>
              )}
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium">Floor Captain Features</h3>
              {isFloorCaptain ? (
                <p className="text-green-600">You have access to floor captain features</p>
              ) : (
                <p className="text-red-600">Floor captain access restricted</p>
              )}
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium">Content Management</h3>
              {hasPermission("can_manage_content") ? (
                <p className="text-green-600">You can manage content</p>
              ) : (
                <p className="text-red-600">Content management restricted</p>
              )}
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium">User Management</h3>
              {hasPermission("can_manage_users") ? (
                <p className="text-green-600">You can manage users</p>
              ) : (
                <p className="text-red-600">User management restricted</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Wrap the component with withRole HOC to protect it
// This is redundant with middleware protection but provides a client-side fallback
export default withRole(ProtectedExample, {
  requiredRoles: ["Admin", "FloorCaptain", "Resident"],
  fallback: (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Access Denied</CardTitle>
        <CardDescription>You don&apos;t have permission to view this page</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Please contact an administrator if you believe you should have access.</p>
      </CardContent>
    </Card>
  ),
  redirectTo: "/login",
})