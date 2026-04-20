"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createTechRequest } from "@/actions/requests"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/layout/page-header"

export default function NewRequestPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [urgency, setUrgency] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !description || !urgency) {
      toast.error("Please fill all required fields")
      return
    }
    setLoading(true)
    const result = await createTechRequest({ title, description, urgency })
    setLoading(false)
    if (result.success) {
      toast.success("Request submitted")
      router.push("/requests")
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Tech Request"
        breadcrumbs={[
          { label: "Requests", href: "/requests" },
          { label: "New" },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. New projector for workshop room"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="What do you need, and why? Include any specifics that would help an admin decide."
          />
        </div>

        <div className="space-y-2">
          <Label>Urgency *</Label>
          <Select
            value={urgency}
            onValueChange={(v) => setUrgency(v ?? "")}
          >
            <SelectTrigger>
              <SelectValue placeholder="How urgent is this?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HIGH">High — Blocking my work</SelectItem>
              <SelectItem value="MEDIUM">Medium — Needed soon</SelectItem>
              <SelectItem value="LOW">Low — Nice to have</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </div>
  )
}
