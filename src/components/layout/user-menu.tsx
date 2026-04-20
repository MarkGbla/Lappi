"use client"

import { signOut, useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { SignOut, Moon, Sun, User } from "@phosphor-icons/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function UserMenu() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className="w-full justify-start gap-2 px-3" />}>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
          <User size={14} weight="bold" />
        </div>
        <div className="flex flex-col items-start text-xs">
          <span className="font-medium">{session?.user?.name}</span>
          <span className="text-muted-foreground">{(session?.user as { role?: string })?.role}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
          <SignOut size={16} className="mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
