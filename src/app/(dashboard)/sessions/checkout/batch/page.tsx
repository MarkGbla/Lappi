"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check } from "@phosphor-icons/react"
import { checkOutAsset } from "@/actions/sessions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

export default function BatchCheckOutPage() {
  const router = useRouter()
  const [people, setPeople] = useState<SimpleItem[]>([])
  const [assets, setAssets] = useState<SimpleItem[]>([])
  const [personId, setPersonId] = useState("")
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([])
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

  const filteredPeople = people.filter((p) =>
    p.label.toLowerCase().includes(personSearch.toLowerCase())
  )
  const filteredAssets = assets.filter((a) =>
    a.label.toLowerCase().includes(assetSearch.toLowerCase())
  )

  function toggleAsset(id: string) {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!personId || selectedAssetIds.length === 0 || !purpose) {
      toast.error("Pick a person, at least one device, and a purpose")
      return
    }
    setLoading(true)

    const results = await Promise.all(
      selectedAssetIds.map((assetId) =>
        checkOutAsset({ personId, assetId, purpose, notes })
      )
    )

    setLoading(false)

    const succeeded = results.filter((r) => r.success).length
    const failed = results.length - succeeded

    if (failed === 0) {
      toast.success(`${succeeded} device${succeeded === 1 ? "" : "s"} checked out`)
      router.push("/sessions")
    } else if (succeeded === 0) {
      toast.error("None of the check-outs succeeded")
    } else {
      toast.warning(`${succeeded} succeeded, ${failed} failed`)
      router.push("/sessions")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batch Check-Out"
        breadcrumbs={[
          { label: "Sessions", href: "/sessions" },
          { label: "Batch Check-Out" },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Person</CardTitle>
          </CardHeader>
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
          <CardHeader>
            <CardTitle className="text-base">
              Select Devices{" "}
              {selectedAssetIds.length > 0 && (
                <span className="text-xs font-normal text-muted-foreground">
                  ({selectedAssetIds.length} selected)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Search by name..."
              value={assetSearch}
              onChange={(e) => setAssetSearch(e.target.value)}
            />
            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredAssets.map((a) => {
                const selected = selectedAssetIds.includes(a.id)
                return (
                  <button
                    type="button"
                    key={a.id}
                    onClick={() => toggleAsset(a.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    <span>
                      {a.label}
                      {a.sub && (
                        <span className="text-xs opacity-70 ml-2">{a.sub}</span>
                      )}
                    </span>
                    {selected && <Check size={16} />}
                  </button>
                )
              })}
              {filteredAssets.length === 0 && (
                <p className="text-sm text-muted-foreground px-3 py-2">
                  No available devices.
                </p>
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
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Applied to every device in this batch (optional)"
          />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              loading || !personId || selectedAssetIds.length === 0 || !purpose
            }
          >
            {loading
              ? "Checking out..."
              : `Check Out ${selectedAssetIds.length || ""} Device${
                  selectedAssetIds.length === 1 ? "" : "s"
                }`}
          </Button>
        </div>
      </form>
    </div>
  )
}
