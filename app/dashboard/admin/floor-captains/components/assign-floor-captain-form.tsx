"use client"

import { useState } from "react"
import { FloorCaptainAssignment, assignFloorCaptain } from "../actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

interface AssignFloorCaptainFormProps {
  availableFloors: number[]
  eligibleUsers: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    profilePictureUrl: string | null
  }[]
  existingAssignments: FloorCaptainAssignment[]
}

// Form validation schema
const formSchema = z.object({
  userId: z.string({
    required_error: "Please select a user"
  }),
  floorNumber: z.number({
    required_error: "Please select a floor"
  })
})

type FormValues = z.infer<typeof formSchema>

export function AssignFloorCaptainForm({ 
  availableFloors,
  eligibleUsers,
  existingAssignments
}: AssignFloorCaptainFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {}
  })
  
  // Get floors that already have captains assigned
  const assignedFloors = existingAssignments.map(a => a.floorNumber)
  
  // Filter out floors that already have captains
  const unassignedFloors = availableFloors.filter(
    floor => !assignedFloors.includes(floor)
  )
  
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    
    try {
      const result = await assignFloorCaptain(values.userId, values.floorNumber)
      
      if (result.success) {
        toast.success("Floor captain assigned successfully")
        form.reset()
        // The page will automatically revalidate due to server action
      } else {
        toast.error(result.error || "Failed to assign floor captain")
      }
    } catch (error) {
      console.error("Error assigning floor captain:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign New Floor Captain</CardTitle>
        <CardDescription>
          Select a verified resident and assign them to be a floor captain
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resident</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting || eligibleUsers.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a resident" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <ScrollArea className="h-72">
                          {eligibleUsers.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No eligible residents
                            </SelectItem>
                          ) : (
                            eligibleUsers.map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage 
                                      src={user.profilePictureUrl || undefined} 
                                      alt={`${user.firstName} ${user.lastName}`}
                                    />
                                    <AvatarFallback>
                                      {user.firstName?.[0]}
                                      {user.lastName?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>
                                    {user.firstName} {user.lastName}
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Only verified residents can be assigned as floor captains
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="floorNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floor</FormLabel>
                    <Select
                      onValueChange={val => field.onChange(Number(val))}
                      value={field.value?.toString()}
                      disabled={isSubmitting || unassignedFloors.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a floor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unassignedFloors.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No floors available
                          </SelectItem>
                        ) : (
                          unassignedFloors.map(floor => (
                            <SelectItem key={floor} value={floor.toString()}>
                              <div className="flex items-center">
                                <Badge variant="outline" className="mr-2">
                                  {floor}
                                </Badge>
                                Floor {floor}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {assignedFloors.length > 0 && (
                        <span>
                          Floors {assignedFloors.join(', ')} already have captains assigned
                        </span>
                      )}
                      {assignedFloors.length === 0 && (
                        <span>Select a floor to assign a captain</span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting || unassignedFloors.length === 0 || eligibleUsers.length === 0}
              className="w-full md:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Icons.plus className="mr-2 h-4 w-4" />
                  Assign Floor Captain
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}