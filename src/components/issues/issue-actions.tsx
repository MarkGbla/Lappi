"use client"

import { useState } from "react"
import { toast } from "sonner"
import { assignIssue, updateIssueStatus } from "@/actions/issues"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = {
  issueId: string
  currentStatus: string
  currentAssigneeId: string | null
  staff: { id: string; name: string }[]
}

const transitions: Record<string, string[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED", "OPEN"],
  RESOLVED: ["CLOSED", "OPEN"],
  CLOSED: ["OPEN"],
}

export function IssueActions({ issueId, currentStatus, currentAssigneeId, staff }: Props) {
  const [assigneeId, setAssigneeId] = useState(currentAssigneeId ?? "")
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [repairCost, setRepairCost] = useState("")
  const [loading, setLoading] = useState(false)

  const validTransitions = transitions[currentStatus] ?? []

  async function handleAssign() {
    if (!assigneeId) return
    setLoading(true)
    const result = await assignIssue({ issueId, assignedToId: assigneeId })
    setLoading(false)
    if (result.success) toast.success("Issue assigned")
    else toast.error(result.error)
  }

  async function handleStatusChange(newStatus: string) {
    setLoading(true)
    const parsedCost = repairCost ? Number(repairCost) : undefined
    const result = await updateIssueStatus({
      issueId,
      status: newStatus,
      resolutionNotes: newStatus === "RESOLVED" ? resolutionNotes : undefined,
      repairCost:
        newStatus === "RESOLVED" && parsedCost && !Number.isNaN(parsedCost)
          ? parsedCost
          : undefined,
    })
    setLoading(false)
    if (result.success) toast.success(`Issue ${newStatus.toLowerCase().replace(/_/g, " ")}`)
    else toast.error(result.error)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentStatus !== "CLOSED" && currentStatus !== "RESOLVED" && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label>Assign to</Label>
              <Select value={assigneeId} onValueChange={(v) => setAssigneeId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAssign} disabled={loading || !assigneeId} variant="secondary" size="sm">
              Assign
            </Button>
          </div>
        )}

        {validTransitions.includes("RESOLVED") && (
          <>
            <div className="space-y-2">
              <Label>Resolution Notes</Label>
              <Textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={2}
                placeholder="What was done to fix this issue?"
              />
            </div>
            <div className="space-y-2">
              <Label>Repair Cost (optional)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={repairCost}
                onChange={(e) => setRepairCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </>
        )}

        <div className="flex flex-wrap gap-2">
          {validTransitions.map((status) => (
            <Button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={loading}
              variant={status === "RESOLVED" || status === "CLOSED" ? "default" : "secondary"}
              size="sm"
            >
              {status === "IN_PROGRESS" && "Start Working"}
              {status === "RESOLVED" && "Mark Resolved"}
              {status === "CLOSED" && "Close Issue"}
              {status === "OPEN" && "Reopen"}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
