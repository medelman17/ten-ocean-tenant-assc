import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import VerifyUserActions from "./components/verify-user-actions"
import { UserProfileWithUnit, UserRoleWithName } from "@/lib/types/db"

export default async function VerifyUsersPage() {
  const supabase = await createClient()
  
  // Check if current user is admin or floor captain
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect("/login")
  }
  
  // Check user roles
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select(`
      role_id,
      roles!inner (name)
    `)
    .eq("user_id", user.id)

  const typedUserRoles = userRoles as UserRoleWithName[] | null
  const isAdmin = typedUserRoles?.some(role => role.roles.name === "Admin")
  const isFloorCaptain = typedUserRoles?.some(role => role.roles.name === "FloorCaptain")
  
  if (!isAdmin && !isFloorCaptain) {
    redirect("/dashboard")
  }
  
  // Fetch pending users that need verification
  let pendingUsersQuery = supabase
    .from("user_profiles")
    .select(`
      id,
      first_name,
      last_name,
      display_name,
      email,
      verification_status,
      created_at,
      unit_id,
      units (
        unit_number,
        floor
      )
    `)
    .eq("verification_status", "pending")
  
  // If user is a floor captain (not admin), only show users on their floor
  if (!isAdmin && isFloorCaptain) {
    // Get the floors this captain is responsible for
    const { data: floorAssignments } = await supabase
      .from("floor_captain_assignments")
      .select("floor_number")
      .eq("user_id", user.id)
    
    if (floorAssignments && floorAssignments.length > 0) {
      const floors = floorAssignments.map(assignment => assignment.floor_number)
      
      pendingUsersQuery = pendingUsersQuery
        .in("units.floor", floors)
    }
  }
  
  const { data: pendingUsers, error: pendingError } = await pendingUsersQuery.order("created_at", { ascending: false })

  // Cast to the correct type
  const typedPendingUsers = pendingUsers as UserProfileWithUnit[] | null

  if (pendingError) {
    console.error("Error fetching pending users:", pendingError)
  }
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Verify Users</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Pending Verification Requests</CardTitle>
          <CardDescription>
            Review and verify users who have registered for the tenant association.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {typedPendingUsers && typedPendingUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {typedPendingUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.display_name || `${user.first_name || ''} ${user.last_name || ''}`}
                    </TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>
                      {user.units ? (
                        <div className="flex flex-col">
                          <span>Unit {user.units.unit_number}</span>
                          <span className="text-xs text-muted-foreground">Floor {user.units.floor}</span>
                        </div>
                      ) : (
                        <Badge variant="outline">No unit</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="pending">Pending</Badge>
                    </TableCell>
                    <TableCell>
                      <VerifyUserActions userId={user.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Icons.check className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-lg font-medium">No pending verifications</p>
              <p className="text-sm text-muted-foreground">
                All user verification requests have been processed.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            {typedPendingUsers?.length || 0} pending verification{typedPendingUsers?.length === 1 ? "" : "s"}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}