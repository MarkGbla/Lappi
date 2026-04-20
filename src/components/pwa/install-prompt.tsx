"use client"

import { useEffect, useState } from "react"
import { DownloadSimple, X } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const DISMISS_KEY = "lappi-install-dismissed"

export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {})
    }

    if (localStorage.getItem(DISMISS_KEY)) return

    const handler = (e: Event) => {
      e.preventDefault()
      setEvent(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  function dismiss() {
    setVisible(false)
    localStorage.setItem(DISMISS_KEY, "1")
  }

  async function install() {
    if (!event) return
    await event.prompt()
    const choice = await event.userChoice
    if (choice.outcome === "accepted") {
      dismiss()
    }
  }

  if (!visible || !event) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 lg:bottom-4 lg:left-auto lg:right-4 lg:w-80 z-40 rounded-lg border border-border bg-background shadow-lg p-4">
      <div className="flex items-start gap-3">
        <DownloadSimple size={20} weight="duotone" className="mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">Install Lappi</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add to your home screen for faster access.
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={install}>
              Install
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>
              Not now
            </Button>
          </div>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="text-muted-foreground hover:text-foreground"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
