import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Providers } from "@/components/providers"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Lappi — Asset Tracking for Christex Foundation",
  description:
    "Track devices, usage, repairs, and tech requests across staff and community members.",
  manifest: "/manifest.webmanifest",
  applicationName: "Lappi",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lappi",
  },
}

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body
        className="min-h-full bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  )
}
