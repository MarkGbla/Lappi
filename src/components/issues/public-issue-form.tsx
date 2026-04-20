"use client"

import { useState } from "react"
import { CheckCircle, Warning } from "@phosphor-icons/react"
import { submitPublicIssue } from "@/actions/public-issues"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function PublicIssueForm({ assetId }: { assetId: string }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [honeypot, setHoneypot] = useState("")
  const [renderedAt] = useState(() => Date.now())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = await submitPublicIssue({
      assetId,
      title: title.trim(),
      description: description.trim(),
      website: honeypot,
      renderedAt,
    })
    setSubmitting(false)
    if (result.success) {
      setSubmitted(true)
    } else {
      setError(result.error)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-start gap-3">
        <CheckCircle
          size={20}
          weight="duotone"
          className="mt-0.5 shrink-0 text-green-600 dark:text-green-500"
        />
        <div className="space-y-1">
          <p className="text-sm font-medium">Thanks — staff have been notified.</p>
          <p className="text-xs text-muted-foreground">
            You can close this page. A team member will look into it.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Honeypot — visually hidden, skip tab order, off autofill. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden">
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="public-issue-title">What&rsquo;s wrong?</Label>
        <Input
          id="public-issue-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Screen flickers when plugged in"
          maxLength={200}
          required
          minLength={3}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="public-issue-description">Details</Label>
        <Textarea
          id="public-issue-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="When did it start? What were you doing? Anything that helps staff reproduce or narrow the problem."
          maxLength={2000}
          required
          minLength={20}
        />
        <p className="text-[11px] text-muted-foreground">
          At least 20 characters. {description.length}/2000
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          <Warning size={14} weight="fill" className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={submitting || title.trim().length < 3 || description.trim().length < 20}
      >
        {submitting ? "Sending..." : "Report issue"}
      </Button>
      <p className="text-[11px] text-muted-foreground text-center">
        Submitted anonymously. No sign-in needed.
      </p>
    </form>
  )
}
