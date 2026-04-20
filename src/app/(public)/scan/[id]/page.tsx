import Image from "next/image"
import { notFound, redirect } from "next/navigation"
import { MapPin } from "@phosphor-icons/react/dist/ssr"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth-helpers"
import { keyToUrl } from "@/lib/ut-url"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PublicIssueForm } from "@/components/issues/public-issue-form"
import type { AssetStatus, AssetType } from "@/generated/prisma/client"

export const dynamic = "force-dynamic"

const TYPE_LABELS: Record<AssetType, string> = {
  LAPTOP: "Laptop",
  DESKTOP: "Desktop",
  TABLET: "Tablet",
  PROJECTOR: "Projector",
  ROUTER: "Router",
  PHONE: "Phone",
  CAMERA: "Camera",
  PRINTER: "Printer",
  NETWORKING: "Networking",
  OTHER: "Other",
}

const STATUS_LABELS: Record<AssetStatus, { label: string; tone: "ok" | "warn" | "busy" }> = {
  AVAILABLE: { label: "In service", tone: "ok" },
  CHECKED_OUT: { label: "In use", tone: "busy" },
  MAINTENANCE: { label: "Being repaired", tone: "warn" },
  NEEDS_ATTENTION: { label: "Reported issue", tone: "warn" },
  RETIRED: { label: "Retired", tone: "warn" },
}

export default async function ScanAssetPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Signed-in staff scanning a QR expect the full dashboard view (history,
  // issues, edit controls). Redirect before hitting the public query so we
  // never render the curated card for someone who has permission to see
  // the real thing.
  const session = await getSession()
  if (session) redirect(`/assets/${id}`)

  const asset = await prisma.asset.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      type: true,
      status: true,
      location: true,
      imageKeys: true,
    },
  })
  if (!asset || asset.status === "RETIRED") notFound()

  const status = STATUS_LABELS[asset.status]
  const imageUrl = asset.imageKeys[0] ? keyToUrl(asset.imageKeys[0]) : null

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0 overflow-hidden">
          {imageUrl ? (
            <div className="relative aspect-video bg-muted">
              <Image
                src={imageUrl}
                alt={asset.name}
                fill
                sizes="(max-width: 640px) 100vw, 576px"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground text-sm">
              No photo
            </div>
          )}
          <div className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-heading text-lg font-semibold leading-tight">
                  {asset.name}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {TYPE_LABELS[asset.type]}
                </p>
              </div>
              <Badge
                variant={status.tone === "ok" ? "secondary" : "outline"}
                className={
                  status.tone === "warn"
                    ? "border-amber-500/50 text-amber-700 dark:text-amber-400"
                    : status.tone === "busy"
                      ? "border-blue-500/50 text-blue-700 dark:text-blue-400"
                      : undefined
                }
              >
                {status.label}
              </Badge>
            </div>
            {asset.location && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin size={12} />
                {asset.location}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <section>
        <h2 className="font-heading text-base font-medium mb-3">
          Report a problem with this device
        </h2>
        <PublicIssueForm assetId={asset.id} />
      </section>
    </div>
  )
}
