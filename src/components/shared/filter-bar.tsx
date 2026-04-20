"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { MagnifyingGlass, X } from "@phosphor-icons/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type FilterOption = { value: string; label: string }

export type FilterField =
  | { kind: "search"; name: string; placeholder?: string }
  | {
      kind: "select"
      name: string
      placeholder: string
      options: FilterOption[]
    }

export function FilterBar({ fields }: { fields: FilterField[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString())
      if (value) params.set(name, value)
      else params.delete(name)
      router.replace(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const hasActive = fields.some((f) => !!searchParams?.get(f.name))

  function clearAll() {
    router.replace(pathname ?? "/")
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      {fields.map((field) => {
        const value = searchParams?.get(field.name) ?? ""
        if (field.kind === "search") {
          return (
            <SearchInput
              key={field.name}
              value={value}
              placeholder={field.placeholder ?? "Search..."}
              onChange={(v) => updateParam(field.name, v)}
            />
          )
        }
        return (
          <Select
            key={field.name}
            value={value}
            onValueChange={(v) => updateParam(field.name, v ?? "")}
          >
            <SelectTrigger className="sm:w-40">
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      })}

      {hasActive && (
        <Button size="sm" variant="ghost" onClick={clearAll}>
          <X size={14} className="mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}

function SearchInput({
  value,
  placeholder,
  onChange,
}: {
  value: string
  placeholder: string
  onChange: (value: string) => void
}) {
  const [local, setLocal] = useState(value)

  useEffect(() => {
    setLocal(value)
  }, [value])

  return (
    <div className="relative flex-1 sm:max-w-xs">
      <MagnifyingGlass
        size={16}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
      <Input
        value={local}
        placeholder={placeholder}
        className="pl-8"
        onChange={(e) => {
          setLocal(e.target.value)
          onChange(e.target.value)
        }}
      />
    </div>
  )
}
