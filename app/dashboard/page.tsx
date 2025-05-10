import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icons } from "@/components/ui/icons"
import { Badge } from "@/components/ui/badge"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select(`
      *,
      units (
        unit_number,
        floor
      )
    `)
    .eq("id", user.id)
    .single()

  // Placeholder data - would be replaced with real data in production
  const upcomingEvents = [
    { title: "Building-wide Meeting", date: "2025-05-15", time: "7:00 PM", location: "Community Room" },
    { title: "Garden Committee", date: "2025-05-18", time: "10:00 AM", location: "Rooftop Garden" },
  ]

  const maintenanceRequests = [
    { title: "Hallway Light Out", status: "in_progress", date: "2025-05-08", priority: "medium" },
  ]

  const announcements = [
    { title: "Summer Pool Schedule", date: "2025-05-07", author: "Building Management" },
    { title: "Elevator Maintenance Notice", date: "2025-05-05", author: "Maintenance Team" },
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <Icons.notification className="mr-2 h-4 w-4" />
            Notifications
          </Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Profile Status
                </CardTitle>
                <Icons.user className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold">
                    {profile?.verification_status === "pending"
                      ? "Pending"
                      : profile?.verification_status === "approved"
                      ? "Verified"
                      : "Unknown"}
                  </div>
                  {profile?.verification_status && (
                    <Badge variant={
                      profile.verification_status === "pending" ? "pending" :
                      profile.verification_status === "approved" ? "success" :
                      "outline"
                    }>
                      {profile.verification_status}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {profile?.verification_status === "pending"
                    ? "Waiting for admin approval"
                    : profile?.verification_status === "approved"
                    ? "Your account is fully verified"
                    : "Please contact an administrator"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Your Unit
                </CardTitle>
                <Icons.home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profile?.units ? `Unit ${profile.units.unit_number}` : "Not Assigned"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {profile?.units
                    ? `Floor ${profile.units.floor}`
                    : "Contact management to assign your unit"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Maintenance Requests
                </CardTitle>
                <Icons.wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{maintenanceRequests.length}</div>
                <p className="text-xs text-muted-foreground">
                  {maintenanceRequests.length === 0
                    ? "No active requests"
                    : maintenanceRequests.length === 1
                    ? "1 active request"
                    : `${maintenanceRequests.length} active requests`}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>
                  Community events in the next 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming events</p>
                ) : (
                  <div className="space-y-4">
                    {upcomingEvents.map((event, i) => (
                      <div key={i} className="flex items-start">
                        <div className="rounded-md bg-primary/10 p-2 mr-3">
                          <Icons.calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()} at {event.time}
                          </p>
                          <p className="text-xs text-muted-foreground">{event.location}</p>
                        </div>
                        <div className="ml-auto">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Announcements</CardTitle>
                <CardDescription>
                  Latest news and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {announcements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent announcements</p>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((announcement, i) => (
                      <div key={i} className="flex items-start">
                        <div className="rounded-md bg-primary/10 p-2 mr-3">
                          <Icons.notification className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{announcement.title}</p>
                          <p className="text-xs text-muted-foreground">
                            By {announcement.author} on {new Date(announcement.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <Button variant="ghost" size="sm">
                            Read
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                View and RSVP to community events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Events content will be implemented in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Requests</CardTitle>
              <CardDescription>
                Track and submit maintenance requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Maintenance request functionality will be implemented in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
              <CardDescription>
                Building and community announcements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Announcement functionality will be implemented in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}