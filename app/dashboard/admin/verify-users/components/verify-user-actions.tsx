"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Icons } from "@/components/ui/icons"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

// Import Inngest functions
import { sendUserVerifiedEvent, sendUserRejectedEvent } from "@/lib/inngest/index"

interface VerifyUserActionsProps {
  userId: string
}

export default function VerifyUserActions({ userId }: VerifyUserActionsProps) {
  const router = useRouter()
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const handleApprove = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("You must be logged in to approve users")
      }
      
      // We don't need to update the verification status here
      // since the Inngest workflow will do that
      
      // Trigger the user verification workflow
      await sendUserVerifiedEvent({
        userId,
        verifiedBy: user.id,
        notes: notes.trim() || undefined
      })
      
      toast.success("User approved successfully")
      setIsApproveOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error approving user:", error)
      toast.error("Failed to approve user")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleReject = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("You must be logged in to reject users")
      }
      
      // We don't need to update the verification status here
      // since the Inngest workflow will do that
      
      // Trigger the user rejection workflow
      await sendUserRejectedEvent({
        userId,
        rejectedBy: user.id,
        reason: notes.trim() || undefined
      })
      
      toast.success("User rejected successfully")
      setIsRejectOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error rejecting user:", error)
      toast.error("Failed to reject user")
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="flex space-x-2">
      {/* Approve Dialog */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">
            <Icons.check className="mr-1 h-3 w-3" />
            Approve
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve User</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this user? They will receive an email notification.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
            <Textarea 
              placeholder="Add any notes about this verification..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isLoading}>
              {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <Icons.trash className="mr-1 h-3 w-3" />
            Reject
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject User</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this user? They will receive an email notification.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-2">Rejection Reason (Optional)</label>
            <Textarea 
              placeholder="Explain why this user is being rejected..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isLoading}>
              {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}