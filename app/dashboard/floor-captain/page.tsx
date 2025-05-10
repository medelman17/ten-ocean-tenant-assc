import { redirect } from "next/navigation"
import { withRoleAuth } from "@/lib/supabase/auth-middleware"
import { Roles } from "@/lib/types/roles"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FloorInfo } from "./components/floor-info"
import { ResidentsList } from "./components/residents-list"
import { FloorAnnouncements } from "./components/floor-announcements"
import { fetchAssignedFloors } from "./actions"

export const metadata = {
  title: "Floor Captain Dashboard - 10 Ocean Tenant Association",
  description: "Manage your assigned floors as a floor captain"
}

export default async function FloorCaptainDashboard() {
  // Verify user is authenticated and has FloorCaptain role
  await withRoleAuth([Roles.FloorCaptain, Roles.Admin])
  
  // Fetch floors assigned to this floor captain
  const assignedFloors = await fetchAssignedFloors()
  
  // If no floors are assigned, redirect to dashboard
  if (!assignedFloors || assignedFloors.length === 0) {
    redirect('/dashboard')
  }
  
  // Default to the first assigned floor
  const defaultFloor = assignedFloors[0]
  
  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Floor Captain Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage residents and information for your assigned floors
          </p>
        </div>
      </div>
      
      <div className="p-6">
        <Tabs defaultValue={String(defaultFloor.floorNumber)} className="w-full">
          <TabsList className="mb-4">
            {assignedFloors.map(floor => (
              <TabsTrigger key={floor.floorNumber} value={String(floor.floorNumber)}>
                Floor {floor.floorNumber}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {assignedFloors.map(floor => (
            <TabsContent key={floor.floorNumber} value={String(floor.floorNumber)} className="space-y-6">
              <FloorInfo floorNumber={floor.floorNumber} />
              
              <Tabs defaultValue="residents">
                <TabsList>
                  <TabsTrigger value="residents">Residents</TabsTrigger>
                  <TabsTrigger value="announcements">Floor Announcements</TabsTrigger>
                </TabsList>
                
                <TabsContent value="residents" className="mt-4">
                  <ResidentsList floorNumber={floor.floorNumber} />
                </TabsContent>
                
                <TabsContent value="announcements" className="mt-4">
                  <FloorAnnouncements floorNumber={floor.floorNumber} />
                </TabsContent>
              </Tabs>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}