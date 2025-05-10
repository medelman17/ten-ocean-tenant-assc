"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchFloorInfo } from "../actions"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface FloorInfoProps {
  floorNumber: number
}

interface FloorInfoData {
  floorNumber: number
  unitCount: number
  residentCount: number
}

export function FloorInfo({ floorNumber }: FloorInfoProps) {
  const [floorInfo, setFloorInfo] = useState<FloorInfoData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const getFloorInfo = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const info = await fetchFloorInfo(floorNumber)
        setFloorInfo(info)
      } catch (err) {
        console.error("Error fetching floor info:", err)
        setError("Failed to load floor information")
      } finally {
        setIsLoading(false)
      }
    }
    
    getFloorInfo()
  }, [floorNumber])
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle>Floor {floorNumber} Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 flex items-center justify-center">
            <Icons.spinner className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (error || !floorInfo) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle>Floor {floorNumber} Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p>{error || "Failed to load floor information"}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Floor {floorNumber} Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center py-4 border rounded-md">
            <p className="text-2xl font-bold">{floorInfo.unitCount}</p>
            <p className="text-sm text-muted-foreground">Units</p>
          </div>
          
          <div className="flex flex-col items-center py-4 border rounded-md">
            <p className="text-2xl font-bold">{floorInfo.residentCount}</p>
            <p className="text-sm text-muted-foreground">Verified Residents</p>
          </div>
          
          <div className="flex flex-col items-center py-4 border rounded-md">
            <p className="text-2xl font-bold">
              {floorInfo.unitCount > 0 
                ? Math.round((floorInfo.residentCount / floorInfo.unitCount) * 100) 
                : 0}%
            </p>
            <p className="text-sm text-muted-foreground">Occupancy Rate</p>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button size="sm" variant="outline" asChild>
            <Link href={{
              pathname: "/dashboard/directory",
              query: { floor: floorNumber.toString() }
            }}>
              <Icons.users className="mr-2 h-4 w-4" />
              View in Directory
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}