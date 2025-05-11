import { checkServerAuth } from "@/lib/supabase/server-auth"
import { ROLES } from "@/lib/types/roles"
import { fetchFloorCaptainAssignments, fetchAvailableFloors, fetchEligibleUsers } from "./actions"
import { FloorCaptainsTable } from "./components/floor-captains-table"
import { AssignFloorCaptainForm } from "./components/assign-floor-captain-form"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Manage Floor Captains - 10 Ocean Tenant Association",
  description: "Assign and manage floor captains for each floor",
}

export default async function FloorCaptainsPage() {
  // Ensure user is authorized as an admin
  try {
    await checkServerAuth([ROLES.ADMIN])
  } catch (error) {
    console.error("Auth error:", error)
    redirect("/login?returnUrl=/dashboard/admin/floor-captains")
  }

  // Fetch data needed for the page
  const assignments = await fetchFloorCaptainAssignments()
  const availableFloors = await fetchAvailableFloors()
  const eligibleUsers = await fetchEligibleUsers()

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Floor Captains</h1>
          <p className="text-muted-foreground mt-1">Assign and manage floor captains for each floor</p>
        </div>
      </div>

      <div className="p-6 grid gap-6">
        <AssignFloorCaptainForm availableFloors={availableFloors} eligibleUsers={eligibleUsers} existingAssignments={assignments} />

        <FloorCaptainsTable assignments={assignments} />
      </div>
    </div>
  )
}
