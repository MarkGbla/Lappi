"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { checkOutAsset } from "@/actions/sessions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"

const purposes = [
  { value: "WORKSHOP", label: "Workshop" },
  { value: "COHORT", label: "Cohort / Training" },
  { value: "PERSONAL_LEARNING", label: "Personal Learning" },
  { value: "RESEARCH", label: "Research" },
  { value: "COMMUNITY_USE", label: "Community Use" },
  { value: "STAFF_WORK", label: "Staff Work" },
]

type SimpleItem = { id: string; label: string; sub?: string }

export default function CheckOutPage() {
  const router = useRouter()
  const [people, setPeople] = useState<SimpleItem[]>([])
  const [assets, setAssets] = useState<SimpleItem[]>([])
  const [personId, setPersonId] = useState("")
  const [assetId, setAssetId] = useState("")
  const [purpose, setPurpose] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [personSearch, setPersonSearch] = useState("")
  const [assetSearch, setAssetSearch] = useState("")

  useEffect(() => {
    fetch("/api/people-search")
      .then((r) => r.json())
      .then(setPeople)
      .catch(() => {})
    fetch("/api/assets-available")
      .then((r) => r.json())
      .then(setAssets)
      .catch(() => {})
  }, [])

  const filteredPeople = people.filter(
    (p) => p.label.toLowerCase().includes(personSearch.toLowerCase())
  )
  const filteredAssets = assets.filter(
    (a) => a.label.toLowerCase().includes(assetSearch.toLowerCase())
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!personId || !assetId || !purpose) {
      toast.error("Please fill all required fields")
      return
    }
    setLoading(true)
    const result = await checkOutAsset({ personId, assetId, purpose, notes })
    setLoading(false)
    if (result.success) {
      toast.success("Device checked out")
      router.push("/sessions")
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Check Out Device"
        breadcrumbs={[
          { label: "Sessions", href: "/sessions" },
          { label: "Check Out" },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <Card>
          <CardHeader><CardTitle className="text-base">Select Person</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Search by name..."
              value={personSearch}
              onChange={(e) => setPersonSearch(e.target.value)}
            />
            <div className="max-h-40 overflow-y-auto space-y-1">
              {filteredPeople.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPersonId(p.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    personId === p.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  {p.label}
                  {p.sub && <span className="text-xs opacity-70 ml-2">{p.sub}</span>}
                </button>
              ))}
              {filteredPeople.length === 0 && (
                <p className="text-sm text-muted-foreground px-3 py-2">No people found.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Select Device</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Search by name..."
              value={assetSearch}
              onChange={(e) => setAssetSearch(e.target.value)}
            />
            <div className="max-h-40 overflow-y-auto space-y-1">
              {filteredAssets.map((a) => (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => setAssetId(a.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    assetId === a.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  {a.label}
                  {a.sub && <span className="text-xs opacity-70 ml-2">{a.sub}</span>}
                </button>
              ))}
              {filteredAssets.length === 0 && (
                <p className="text-sm text-muted-foreground px-3 py-2">No available devices.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Label>Purpose *</Label>
          <Select value={purpose} onValueChange={(v) => setPurpose(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent>
              {purposes.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optional" />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading || !personId || !assetId || !purpose}>
            {loading ? "Checking out..." : "Confirm Check-Out"}
          </Button>
        </div>
      </form>
    </div>
  )
}
