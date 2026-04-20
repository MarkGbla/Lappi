"use client"

import { useState } from "react"
import { toast } from "sonner"
import { SignIn } from "@phosphor-icons/react"
import { checkInAsset } from "@/actions/sessions"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CheckInButton({ sessionId, assetName }: { sessionId: string; assetName: string }) {
  const [open, setOpen] = useState(false)
  const [condition, setCondition] = useState<string>("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleCheckIn() {
    setLoading(true)
    const result = await checkInAsset({
      sessionId,
      conditionOnReturn: condition || undefined,
      notes: notes || undefined,
    })
    setLoading(false)
    if (result.success) {
      toast.success(`${assetName} checked in`)
      setOpen(false)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="secondary" />}>
        <SignIn size={16} className="mr-1" />
        Check In
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check In: {assetName}</DialogTitle>
          <DialogDescription>Record the return of this device.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Condition on Return</Label>
            <Select value={condition} onValueChange={(v) => setCondition(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select condition (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXCELLENT">Excellent</SelectItem>
                <SelectItem value="GOOD">Good</SelectItem>
                <SelectItem value="FAIR">Fair</SelectItem>
                <SelectItem value="POOR">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about the return..."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCheckIn} disabled={loading}>
            {loading ? "Checking in..." : "Confirm Check-In"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
