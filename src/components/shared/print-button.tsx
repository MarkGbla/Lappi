"use client"

import { Printer } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

export function PrintButton() {
  return (
    <Button size="sm" variant="secondary" onClick={() => window.print()}>
      <Printer size={16} className="mr-1" />
      Print
    </Button>
  )
}
