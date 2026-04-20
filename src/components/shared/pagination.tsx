"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

export function Pagination({
  page,
  pageCount,
}: {
  page: number
  pageCount: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (pageCount <= 1) return null

  function go(newPage: number) {
    const params = new URLSearchParams(searchParams?.toString())
    if (newPage <= 1) params.delete("page")
    else params.set("page", String(newPage))
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between gap-2 pt-2">
      <span className="text-xs text-muted-foreground">
        Page {page} of {pageCount}
      </span>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => go(page - 1)}
          disabled={page <= 1}
        >
          <CaretLeft size={14} />
          Prev
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => go(page + 1)}
          disabled={page >= pageCount}
        >
          Next
          <CaretRight size={14} />
        </Button>
      </div>
    </div>
  )
}
