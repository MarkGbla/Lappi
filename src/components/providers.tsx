"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { IconContext } from "@phosphor-icons/react"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <IconContext.Provider value={{ size: 20, weight: "regular" }}>
          {children}
          <Toaster />
        </IconContext.Provider>
      </ThemeProvider>
    </SessionProvider>
  )
}
