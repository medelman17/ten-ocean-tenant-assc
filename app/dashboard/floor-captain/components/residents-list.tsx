"use client"

import { useEffect, useState } from "react"
import { fetchFloorResidents } from "../actions"
import { ResidentProfile } from "@/lib/types/directory"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table"
import { Icons } from "@/components/ui/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ResidentModal } from "@/app/dashboard/directory/components/resident-modal"

interface ResidentsListProps {
  floorNumber: number
}

export function ResidentsList({ floorNumber }: ResidentsListProps) {
  const [residents, setResidents] = useState<ResidentProfile[]>([])
  const [filteredResidents, setFilteredResidents] = useState<ResidentProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedResident, setSelectedResident] = useState<ResidentProfile | null>(null)
  const [messageSubject, setMessageSubject] = useState("")
  const [messageText, setMessageText] = useState("")
  const [sending, setSending] = useState(false)
  
  useEffect(() => {
    const getResidents = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const data = await fetchFloorResidents(floorNumber)
        setResidents(data)
        setFilteredResidents(data)
      } catch (err) {
        console.error("Error fetching residents:", err)
        setError("Failed to load residents for this floor")
      } finally {
        setIsLoading(false)
      }
    }
    
    getResidents()
  }, [floorNumber])
  
  // Filter residents based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredResidents(residents)
      return
    }
    
    const query = searchQuery.toLowerCase()
    const filtered = residents.filter(resident => {
      const fullName = `${resident.firstName || ''} ${resident.lastName || ''}`.toLowerCase()
      const displayName = (resident.displayName || '').toLowerCase()
      const unitNumber = resident.unit?.unitNumber.toLowerCase() || ''
      
      return (
        fullName.includes(query) ||
        displayName.includes(query) ||
        unitNumber.includes(query)
      )
    })
    
    setFilteredResidents(filtered)
  }, [residents, searchQuery])
  
  const handleSendMessage = async (resident: ResidentProfile) => {
    setSending(true)
    
    try {
      // In a real implementation, this would send a message to the resident
      console.log(`Sending message to ${resident.firstName} ${resident.lastName}`, {
        subject: messageSubject,
        message: messageText
      })
      
      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Clear form
      setMessageSubject("")
      setMessageText("")
      
      // Show success (in a real implementation)
      alert(`Message sent to ${resident.firstName} ${resident.lastName}`)
    } catch (err) {
      console.error("Error sending message:", err)
      alert("Failed to send message")
    } finally {
      setSending(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icons.spinner className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    )
  }
  
  if (residents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Icons.userX className="mx-auto h-12 w-12 mb-4 text-muted-foreground/60" />
        <h3 className="text-lg font-medium">No residents found</h3>
        <p className="max-w-sm mx-auto mt-2">
          There are no verified residents on Floor {floorNumber} at this time.
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
          <Input
            type="search"
            placeholder="Search residents..."
            className="pl-8"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Icons.mail className="mr-2 h-4 w-4" />
          Email All Residents
        </Button>
      </div>
      
      <Card>
        <CardHeader className="px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              Floor {floorNumber} Residents
              <Badge variant="secondary" className="ml-2">
                {residents.length}
              </Badge>
            </h3>
          </div>
        </CardHeader>
        <CardContent className="px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Name</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="hidden md:table-cell">Move-In Date</TableHead>
                <TableHead className="hidden md:table-cell">Occupation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No residents match your search
                  </TableCell>
                </TableRow>
              ) : (
                filteredResidents.map(resident => (
                  <TableRow key={resident.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={resident.profilePictureUrl || undefined} />
                          <AvatarFallback>
                            {resident.firstName?.[0]}{resident.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {resident.firstName} {resident.lastName}
                          </div>
                          {resident.displayName && (
                            <div className="text-sm text-muted-foreground">
                              {resident.displayName}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{resident.unit?.unitNumber || 'N/A'}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {resident.moveInDate 
                        ? new Date(resident.moveInDate).toLocaleDateString() 
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {resident.occupation || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setSelectedResident(resident)}
                        >
                          <Icons.user className="h-4 w-4" />
                          <span className="sr-only">View Profile</span>
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Icons.mail className="h-4 w-4" />
                              <span className="sr-only">Message Resident</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Send Message to {resident.firstName} {resident.lastName}
                              </DialogTitle>
                              <DialogDescription>
                                This will send an email to the resident.
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                  id="subject"
                                  value={messageSubject}
                                  onChange={e => setMessageSubject(e.target.value)}
                                  placeholder="Message subject..."
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                  id="message"
                                  value={messageText}
                                  onChange={e => setMessageText(e.target.value)}
                                  placeholder="Write your message here..."
                                  rows={5}
                                />
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button 
                                onClick={() => handleSendMessage(resident)}
                                disabled={!messageSubject || !messageText || sending}
                              >
                                {sending ? (
                                  <>
                                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  <>Send Message</>
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between px-6 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {filteredResidents.length} of {residents.length} residents
          </div>
        </CardFooter>
      </Card>
      
      {selectedResident && (
        <ResidentModal
          resident={selectedResident}
          isOpen={!!selectedResident}
          onClose={() => setSelectedResident(null)}
        />
      )}
    </div>
  )
}