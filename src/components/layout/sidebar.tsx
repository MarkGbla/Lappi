"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  House,
  Desktop,
  ArrowsLeftRight,
  Users,
  Warning,
  ClipboardText,
  ActivityIcon,
  ChartBar,
  type Icon,
} from "@phosphor-icons/react"
// Icon type is re-exported from the main @phosphor-icons/react entry above
import { cn } from "@/lib/utils"
import { UserMenu } from "./user-menu"

type NavItem = {
  href: string
  label: string
  icon: Icon
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: House },
  { href: "/assets", label: "Assets", icon: Desktop },
  { href: "/sessions", label: "Sessions", icon: ArrowsLeftRight },
  { href: "/people", label: "People", icon: Users },
  { href: "/issues", label: "Issues", icon: Warning },
  { href: "/requests", label: "Requests", icon: ClipboardText },
  { href: "/activity", label: "Activity", icon: ActivityIcon },
  { href: "/reports", label: "Reports", icon: ChartBar },
]

export function Sidebar() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:border-r lg:border-border bg-background h-screen sticky top-0">
      <div className="flex h-20 items-center border-b border-border px-5">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-foreground"
        >
          <Image
            src="/mascot/lappi.png"
            alt=""
            width={56}
            height={56}
            className="size-12 object-contain dark:invert"
            priority
          />
          Lappi
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <NavSection label="Workspace" items={navItems} isActive={isActive} />
      </nav>

      <div className="border-t border-border p-3">
        <UserMenu />
      </div>
    </aside>
  )
}

function NavSection({
  label,
  items,
  isActive,
  className,
}: {
  label: string
  items: NavItem[]
  isActive: (href: string) => boolean
  className?: string
}) {
  return (
    <div className={className}>
      <div className="px-2 mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full bg-foreground"
                  />
                )}
                <Icon
                  size={16}
                  weight={active ? "fill" : "regular"}
                  className={cn(
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                />
                <span className={active ? "font-medium" : ""}>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
