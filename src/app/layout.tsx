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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000")

const title = "Lappi — Asset Tracking for Christex Foundation"
const description =
  "Track devices, usage, repairs, and tech requests across staff and community members."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  manifest: "/manifest.webmanifest",
  applicationName: "Lappi",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lappi",
  },
  openGraph: {
    type: "website",
    siteName: "Lappi",
    title,
    description,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
}

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
