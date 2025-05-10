"use client"

import { useCallback, useMemo, useState } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { ResidentProfile } from "@/lib/types/directory"
import { ResidentModal } from "./resident-modal"
import { useResidents } from "@/hooks/use-residents"

export function DirectoryList() {
  const searchParams = useSearchParams()
  const { residents, isLoading, error } = useResidents()
  
  const [selectedResident, setSelectedResident] = useState<ResidentProfile | null>(null)

  // Get filter values from URL
  const floorFilter = searchParams.get('floor')
  const searchQuery = searchParams.get('q')?.toLowerCase()
  
  // Filter residents based on URL params
  const filteredResidents = useMemo(() => {
    if (!residents) return []
    
    return residents.filter(resident => {
      // Filter by floor
      if (floorFilter && resident.unit?.floor.toString() !== floorFilter) {
        return false
      }
      
      // Filter by search query
      if (searchQuery) {
        const fullName = `${resident.firstName} ${resident.lastName}`.toLowerCase()
        const displayName = resident.displayName?.toLowerCase() || ""
        const unitNumber = resident.unit?.unitNumber.toLowerCase() || ""
        
        return (
          fullName.includes(searchQuery) || 
          displayName.includes(searchQuery) ||
          unitNumber.includes(searchQuery)
        )
      }
      
      return true
    })
  }, [residents, floorFilter, searchQuery])

  const handleOpenResidentModal = useCallback((resident: ResidentProfile) => {
    setSelectedResident(resident)
  }, [])

  const handleCloseResidentModal = useCallback(() => {
    setSelectedResident(null)
  }, [])
  
  if (isLoading) {
    return <p>Loading residents...</p>
  }
  
  if (error) {
    return <p className="text-destructive">Error loading residents: {error.message}</p>
  }

  if (filteredResidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Icons.userX className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No residents found</h3>
        <p className="text-muted-foreground mt-1 max-w-md">
          {searchQuery || floorFilter 
            ? "Try adjusting your filters or search terms." 
            : "There are no verified residents to display yet."}
        </p>
      </div>
    )
  }
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResidents.map(resident => (
          <ResidentCard 
            key={resident.id} 
            resident={resident} 
            onSelect={handleOpenResidentModal}
          />
        ))}
      </div>
      
      {selectedResident && (
        <ResidentModal 
          resident={selectedResident} 
          isOpen={!!selectedResident} 
          onClose={handleCloseResidentModal} 
        />
      )}
    </>
  )
}

interface ResidentCardProps {
  resident: ResidentProfile
  onSelect: (resident: ResidentProfile) => void
}

function ResidentCard({ resident, onSelect }: ResidentCardProps) {
  const defaultAvatar = `https://avatar.vercel.sh/${resident.id}?size=128`
  
  const handleSelect = useCallback(() => {
    onSelect(resident)
  }, [resident, onSelect])
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-32 w-full bg-muted">
          <div className="absolute bottom-0 left-0 right-0 px-4 py-2 flex justify-between items-end">
            <div className="flex flex-col">
              <Badge variant="secondary" className="w-fit mb-1">
                {resident.unit?.unitNumber || "No Unit"}
              </Badge>
              <h3 className="text-lg font-semibold text-white drop-shadow-md">
                {resident.displayName || `${resident.firstName} ${resident.lastName}`}
              </h3>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-6">
        <div className="grid grid-cols-[auto_1fr] gap-4 items-center">
          <div className="relative h-16 w-16 rounded-full bg-muted overflow-hidden border-2 border-background -mt-12">
            <Image
              src={resident.profilePictureUrl || defaultAvatar}
              alt={resident.displayName || `${resident.firstName} ${resident.lastName}`}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="font-medium line-clamp-1">
              {resident.firstName} {resident.lastName}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {resident.occupation || ""}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm line-clamp-2">{resident.bio || "No bio provided."}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button variant="outline" size="sm" onClick={handleSelect}>
          View Profile
        </Button>
      </CardFooter>
    </Card>
  )
}