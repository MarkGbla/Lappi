"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  House,
  Desktop,
  ArrowsLeftRight,
  Users,
  DotsThree,
} from "@phosphor-icons/react"
import {
  Warning,
  ClipboardText,
  ActivityIcon,
  ChartBar,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from "react"

const primaryTabs = [
  { href: "/", label: "Home", icon: House },
  { href: "/assets", label: "Assets", icon: Desktop },
  { href: "/sessions", label: "Sessions", icon: ArrowsLeftRight },
  { href: "/people", label: "People", icon: Users },
]

const moreItems = [
  { href: "/issues", label: "Issues", icon: Warning },
  { href: "/requests", label: "Requests", icon: ClipboardText },
  { href: "/activity", label: "Activity", icon: ActivityIcon },
  { href: "/reports", label: "Reports", icon: ChartBar },
]

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const isMoreActive = moreItems.some((item) => isActive(item.href))

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background lg:hidden">
      <div className="flex items-center justify-around h-14">
        {primaryTabs.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-xs transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <Icon size={22} weight={active ? "fill" : "bold"} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-xs transition-colors",
              isMoreActive ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <DotsThree size={22} weight="bold" />
            <span className="font-medium">More</span>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-xl">
            <SheetHeader>
              <SheetTitle>More</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-3 gap-4 py-4">
              {moreItems.map((item) => {
                const active = isActive(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg p-3 text-sm transition-colors",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <Icon size={24} weight={active ? "fill" : "bold"} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
