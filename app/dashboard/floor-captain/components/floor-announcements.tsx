"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface FloorAnnouncementsProps {
  floorNumber: number
}

export function FloorAnnouncements({ floorNumber }: FloorAnnouncementsProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Floor {floorNumber} Announcements</h3>
        <Button disabled>
          <Icons.plus className="mr-2 h-4 w-4" />
          New Announcement
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Icons.construction className="h-4 w-4" />
            <AlertTitle>Feature in Development</AlertTitle>
            <AlertDescription>
              Floor announcements functionality will be available in a future update.
              This feature will allow floor captains to create and manage announcements
              specifically for residents on their assigned floors.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}