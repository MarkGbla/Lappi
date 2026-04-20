import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { PencilSimple, QrCode } from "@phosphor-icons/react/dist/ssr"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/layout/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { keyToUrl } from "@/lib/ut-url"
import {
  utilisationRate,
  healthScore,
  healthLabel,
} from "@/lib/asset-metrics"

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      sessions: {
        include: { person: true, checkedOutBy: true },
        orderBy: { checkedOutAt: "desc" },
        take: 20,
      },
      issues: {
        include: { reportedBy: true, assignedTo: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  })

  if (!asset) notFound()

  const now = new Date()
  const allSessions = await prisma.usageSession.findMany({
    where: { assetId: asset.id },
    select: { checkedOutAt: true, checkedInAt: true },
  })
  const utilisation = utilisationRate(asset, allSessions, now)
  const health = healthScore(asset, asset.issues, now)
  const healthMeta = healthLabel(health)

  return (
    <div className="space-y-6">
      <PageHeader
        title={asset.name}
        breadcrumbs={[
          { label: "Assets", href: "/assets" },
          { label: asset.name },
        ]}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" render={<Link href={`/assets/${asset.id}/qr`} />}>
              <QrCode size={16} className="mr-1" />
              QR
            </Button>
            <Button variant="secondary" size="sm" render={<Link href={`/assets/${asset.id}/edit`} />}>
              <PencilSimple size={16} className="mr-1" />
              Edit
            </Button>
          </div>
        }
      />

      {asset.imageKeys.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              {asset.imageKeys.map((key, idx) => (
                <Image
                  key={key}
                  src={keyToUrl(key)}
                  alt={`Photo ${idx + 1} of ${asset.name}`}
                  width={160}
                  height={160}
                  sizes="160px"
                  priority={idx === 0}
                  className="h-40 w-40 rounded-lg object-cover border border-border bg-muted"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase">Status</div>
              <div className="mt-1"><StatusBadge value={asset.status} variant="status" /></div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase">Condition</div>
              <div className="mt-1"><StatusBadge value={asset.condition} variant="condition" /></div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase">Type</div>
              <div className="mt-1 text-sm">{asset.type.replace(/_/g, " ")}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase">Location</div>
              <div className="mt-1 text-sm">{asset.location ?? "—"}</div>
            </div>
            {asset.serialNumber && (
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase">Serial</div>
                <div className="mt-1 text-sm font-mono">{asset.serialNumber}</div>
              </div>
            )}
            {asset.purchaseDate && (
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase">Purchase Date</div>
                <div className="mt-1 text-sm">{new Date(asset.purchaseDate).toLocaleDateString()}</div>
              </div>
            )}
          </div>
          {asset.notes && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs font-medium text-muted-foreground uppercase mb-1">Notes</div>
              <p className="text-sm whitespace-pre-wrap">{asset.notes}</p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase">Utilisation</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{utilisation}%</span>
                <span className="text-xs text-muted-foreground">last 180 days</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${utilisation}%` }}
                />
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase">Health Score</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${healthMeta.colour}`}>{health}</span>
                <span className={`text-xs font-medium ${healthMeta.colour}`}>
                  {healthMeta.label}
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${health}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sessions">
        <TabsList>
          <TabsTrigger value="sessions">Sessions ({asset.sessions.length})</TabsTrigger>
          <TabsTrigger value="issues">Issues ({asset.issues.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-4 space-y-3">
          {asset.sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No usage sessions yet.</p>
          ) : (
            asset.sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <div className="text-sm font-medium">
                    {s.person.firstName} {s.person.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {s.purpose.replace(/_/g, " ")} &middot; {new Date(s.checkedOutAt).toLocaleDateString()}
                    {s.checkedInAt ? ` — ${new Date(s.checkedInAt).toLocaleDateString()}` : " (active)"}
                  </div>
                </div>
                {!s.checkedInAt && (
                  <StatusBadge value="CHECKED_OUT" variant="status" />
                )}
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="issues" className="mt-4 space-y-3">
          {asset.issues.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No issues reported.</p>
          ) : (
            asset.issues.map((issue) => (
              <Link
                key={issue.id}
                href={`/issues/${issue.id}`}
                className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent transition-colors"
              >
                <div>
                  <div className="text-sm font-medium">{issue.title}</div>
                  <div className="text-xs text-muted-foreground">
                    Reported by {issue.reportedBy.firstName} {issue.reportedBy.lastName} &middot;{" "}
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge value={issue.severity} variant="severity" />
                  <StatusBadge value={issue.status} variant="issueStatus" />
                </div>
              </Link>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
