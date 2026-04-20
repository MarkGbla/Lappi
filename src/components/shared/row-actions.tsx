"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { DotsThreeVertical, PencilSimple, Trash } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ActionResult } from "@/types"

type Props = {
  /** Href for the row's edit page. Omit to hide the Edit action. */
  editHref?: string
  /** Server action invoked when Delete is confirmed. Must accept the id. */
  onDelete?: (id: string) => Promise<ActionResult<unknown>>
  /** Id to pass to `onDelete`. */
  id: string
  /** Shown in the confirmation body, e.g. the asset name. */
  itemName: string
  /** Extra context line in the confirmation (e.g. "and its photo"). */
  description?: string
  /** Toast message on success (defaults to "Deleted"). */
  successMessage?: string
}

export function RowActions({
  editHref,
  onDelete,
  id,
  itemName,
  description,
  successMessage = "Deleted",
}: Props) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!onDelete) return
    startTransition(async () => {
      const result = await onDelete(id)
      if (result.success) {
        toast.success(successMessage)
        setConfirmOpen(false)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${itemName}`}
              // Stop table-row click handlers (e.g. Link navigation in the
              // wrapping row) from firing when the kebab is tapped.
              onClick={(e) => e.stopPropagation()}
            />
          }
        >
          <DotsThreeVertical weight="bold" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={4} className="min-w-36">
          {editHref && (
            <DropdownMenuItem render={<Link href={editHref} />}>
              <PencilSimple size={14} />
              <span>Edit</span>
            </DropdownMenuItem>
          )}
          {editHref && onDelete && <DropdownMenuSeparator />}
          {onDelete && (
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash size={14} />
              <span>Delete</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {itemName}?</DialogTitle>
            <DialogDescription>
              {description ??
                "This permanently removes the record. This can't be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setConfirmOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
