"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import {
  DownloadSimple,
  Export,
  Plus,
  X,
  DeviceMobile,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

type Platform = "android" | "ios" | "other"

const DISMISS_KEY = "lappi-install-dismissed"
const IOS_DELAY_MS = 4000

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other"
  const ua = navigator.userAgent
  // iPadOS 13+ reports as Mac; disambiguate via touch support.
  const isIPadOS =
    /Mac/.test(ua) &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1
  if (/iPad|iPhone|iPod/.test(ua) || isIPadOS) return "ios"
  if (/Android/.test(ua)) return "android"
  return "other"
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  // Android/desktop Chrome
  if (window.matchMedia("(display-mode: standalone)").matches) return true
  // iOS Safari sets this proprietary flag when launched from home screen
  const navStandalone = (navigator as Navigator & { standalone?: boolean })
    .standalone
  return navStandalone === true
}

export function InstallPrompt() {
  const pathname = usePathname()
  const suppressed = pathname?.startsWith("/scan") ?? false
  const [platform] = useState<Platform>(() =>
    typeof window === "undefined" ? "other" : detectPlatform()
  )
  const [deferredEvent, setDeferredEvent] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [bannerOpen, setBannerOpen] = useState(false)
  const [iosDialogOpen, setIosDialogOpen] = useState(false)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {})
    }

    if (suppressed) return
    if (isStandalone()) return
    if (localStorage.getItem(DISMISS_KEY)) return

    const p = platform

    if (p === "android" || p === "other") {
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredEvent(e as BeforeInstallPromptEvent)
        setBannerOpen(true)
      }
      window.addEventListener("beforeinstallprompt", handler)

      const onInstalled = () => {
        setBannerOpen(false)
        setDeferredEvent(null)
        localStorage.setItem(DISMISS_KEY, "installed")
      }
      window.addEventListener("appinstalled", onInstalled)

      return () => {
        window.removeEventListener("beforeinstallprompt", handler)
        window.removeEventListener("appinstalled", onInstalled)
      }
    }

    if (p === "ios") {
      const t = window.setTimeout(() => setBannerOpen(true), IOS_DELAY_MS)
      return () => window.clearTimeout(t)
    }
  }, [platform, suppressed])

  function dismiss() {
    setBannerOpen(false)
    setIosDialogOpen(false)
    localStorage.setItem(DISMISS_KEY, "1")
  }

  async function handleInstall() {
    if (platform === "ios") {
      setIosDialogOpen(true)
      return
    }
    if (!deferredEvent) return
    await deferredEvent.prompt()
    const choice = await deferredEvent.userChoice
    if (choice.outcome === "accepted") {
      setBannerOpen(false)
      setDeferredEvent(null)
    } else {
      dismiss()
    }
  }

  const canShowBanner =
    bannerOpen &&
    (platform === "ios" || (platform !== "other" && deferredEvent !== null))

  return (
    <>
      {canShowBanner && (
        <div
          role="dialog"
          aria-label="Install Lappi"
          className="fixed left-4 right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 rounded-lg border border-border bg-background shadow-lg p-4 lg:bottom-[calc(1rem+env(safe-area-inset-bottom))] lg:left-auto lg:right-4 lg:w-80"
        >
          <div className="flex items-start gap-3">
            <DownloadSimple
              size={20}
              weight="duotone"
              className="mt-0.5 shrink-0"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">Install Lappi</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {platform === "ios"
                  ? "Add it to your Home Screen for a full-screen, app-like experience."
                  : "Add to your home screen for faster access and offline support."}
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleInstall}>
                  {platform === "ios" ? "How to install" : "Install"}
                </Button>
                <Button size="sm" variant="ghost" onClick={dismiss}>
                  Not now
                </Button>
              </div>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss install prompt"
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <Dialog open={iosDialogOpen} onOpenChange={setIosDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DeviceMobile size={18} weight="duotone" />
              Install Lappi on iOS
            </DialogTitle>
            <DialogDescription>
              Safari on iPhone/iPad installs web apps through the Share menu.
              Follow these three steps.
            </DialogDescription>
          </DialogHeader>

          <ol className="flex flex-col gap-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                1
              </span>
              <span className="flex-1">
                Tap the{" "}
                <span className="inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5">
                  <Export size={14} weight="regular" />
                  <span className="font-medium">Share</span>
                </span>{" "}
                button in Safari&rsquo;s toolbar.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                2
              </span>
              <span className="flex-1">
                Scroll and tap{" "}
                <span className="inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5">
                  <Plus size={14} weight="regular" />
                  <span className="font-medium">Add to Home Screen</span>
                </span>
                .
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                3
              </span>
              <span className="flex-1">
                Tap <span className="font-medium">Add</span> in the top-right
                corner. Lappi will appear on your Home Screen.
              </span>
            </li>
          </ol>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIosDialogOpen(false)}
            >
              Close
            </Button>
            <Button size="sm" onClick={dismiss}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
