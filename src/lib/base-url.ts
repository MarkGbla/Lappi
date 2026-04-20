// Canonical origin for URLs embedded in QR codes, emails, etc.
// Order: explicit override → Vercel production URL → legacy NEXTAUTH_URL →
// localhost fallback for dev.
export function getBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL
  if (explicit) return explicit.replace(/\/+$/, "")

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercelProd) return `https://${vercelProd}`

  const nextAuthUrl = process.env.NEXTAUTH_URL
  if (nextAuthUrl) return nextAuthUrl.replace(/\/+$/, "")

  return "http://localhost:3000"
}
