"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createIssue } from "@/actions/issues"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/layout/page-header"

type SimpleItem = { id: string; label: string; sub?: string }

export default function NewIssuePage() {
  const router = useRouter()
  const [assets, setAssets] = useState<SimpleItem[]>([])
  const [assetId, setAssetId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/assets-all")
      .then((r) => r.json())
      .then(setAssets)
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!assetId || !title || !description || !severity) {
      toast.error("Please fill all required fields")
      return
    }
    setLoading(true)
    const result = await createIssue({ assetId, title, description, severity })
    setLoading(false)
    if (result.success) {
      toast.success("Issue reported")
      router.push("/issues")
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Issue"
        breadcrumbs={[
          { label: "Issues", href: "/issues" },
          { label: "New" },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <div className="space-y-2">
          <Label>Asset *</Label>
          <Select value={assetId} onValueChange={(v) => setAssetId(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Select device" />
            </SelectTrigger>
            <SelectContent>
              {assets.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Title *</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief description of the issue" />
        </div>

        <div className="space-y-2">
          <Label>Description *</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Detailed description of the problem..." />
        </div>

        <div className="space-y-2">
          <Label>Severity *</Label>
          <Select value={severity} onValueChange={(v) => setSeverity(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low — Minor, non-blocking</SelectItem>
              <SelectItem value="MEDIUM">Medium — Partial functionality issue</SelectItem>
              <SelectItem value="HIGH">High — Major functionality impaired</SelectItem>
              <SelectItem value="CRITICAL">Critical — Device unusable</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Reporting..." : "Report Issue"}
          </Button>
        </div>
      </form>
    </div>
  )
}
