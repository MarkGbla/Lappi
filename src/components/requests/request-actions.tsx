"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  reviewTechRequest,
  fulfillTechRequest,
} from "@/actions/requests"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Check, X, Package } from "@phosphor-icons/react"

export function RequestReviewActions({
  requestId,
  status,
}: {
  requestId: string
  status: string
}) {
  if (status === "PENDING") {
    return (
      <div className="flex flex-wrap gap-2">
        <ReviewDialog requestId={requestId} decision="APPROVED" />
        <ReviewDialog requestId={requestId} decision="DENIED" />
      </div>
    )
  }
  if (status === "APPROVED") {
    return <FulfillButton requestId={requestId} />
  }
  return null
}

function ReviewDialog({
  requestId,
  decision,
}: {
  requestId: string
  decision: "APPROVED" | "DENIED"
}) {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    const result = await reviewTechRequest({
      requestId,
      decision,
      reviewNotes: notes,
    })
    setLoading(false)
    if (result.success) {
      toast.success(`Request ${decision.toLowerCase()}`)
      setOpen(false)
    } else {
      toast.error(result.error)
    }
  }

  const isApprove = decision === "APPROVED"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant={isApprove ? "default" : "secondary"} />
        }
      >
        {isApprove ? (
          <Check size={16} className="mr-1" />
        ) : (
          <X size={16} className="mr-1" />
        )}
        {isApprove ? "Approve" : "Deny"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isApprove ? "Approve Request" : "Deny Request"}
          </DialogTitle>
          <DialogDescription>
            {isApprove
              ? "Leave a note explaining next steps (optional)."
              : "Let the requester know why this was denied (optional)."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label>Review notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={isApprove ? "We have one in stock..." : "Out of budget this quarter..."}
          />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : `Confirm ${isApprove ? "Approve" : "Deny"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FulfillButton({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleFulfill() {
    setLoading(true)
    const result = await fulfillTechRequest(requestId)
    setLoading(false)
    if (result.success) {
      toast.success("Request marked fulfilled")
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Button size="sm" onClick={handleFulfill} disabled={loading}>
      <Package size={16} className="mr-1" />
      {loading ? "Saving..." : "Mark Fulfilled"}
    </Button>
  )
}
