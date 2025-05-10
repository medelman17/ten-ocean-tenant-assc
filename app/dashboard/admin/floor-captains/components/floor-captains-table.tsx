"use client"

import { useState } from "react"
import { FloorCaptainAssignment, removeFloorCaptainAssignment } from "../actions"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icons } from "@/components/ui/icons"
import { Badge } from "@/components/ui/badge"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { toast } from "sonner"

interface FloorCaptainsTableProps {
  assignments: FloorCaptainAssignment[]
}

export function FloorCaptainsTable({ assignments }: FloorCaptainsTableProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [assignmentToRemove, setAssignmentToRemove] = useState<FloorCaptainAssignment | null>(null)
  
  const handleRemoveAssignment = async () => {
    if (!assignmentToRemove) return
    
    setIsRemoving(true)
    
    try {
      const result = await removeFloorCaptainAssignment(assignmentToRemove.id)
      
      if (result.success) {
        toast.success("Floor captain removed successfully")
        // The page will automatically revalidate due to server action
      } else {
        toast.error(result.error || "Failed to remove floor captain")
      }
    } catch (error) {
      console.error("Error removing floor captain:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsRemoving(false)
      setAssignmentToRemove(null)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Floor Captain Assignments</CardTitle>
        <CardDescription>
          Current floor captains for each floor
        </CardDescription>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No floor captains assigned yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Floor</TableHead>
                <TableHead>Captain</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Assigned On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map(assignment => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <Badge variant="outline">Floor {assignment.floorNumber}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={assignment.user?.profilePictureUrl || undefined} 
                          alt={`${assignment.user?.firstName} ${assignment.user?.lastName}`}
                        />
                        <AvatarFallback>
                          {assignment.user?.firstName?.[0]}
                          {assignment.user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        {assignment.user?.firstName} {assignment.user?.lastName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {assignment.user?.email}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(new Date(assignment.assignedAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setAssignmentToRemove(assignment)}
                        >
                          <Icons.trash className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Remove assignment</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remove Floor Captain Assignment
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {assignment.user?.firstName} {assignment.user?.lastName} as 
                            the floor captain for Floor {assignment.floorNumber}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleRemoveAssignment}
                            disabled={isRemoving}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isRemoving ? (
                              <>
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                Removing...
                              </>
                            ) : (
                              'Remove'
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}