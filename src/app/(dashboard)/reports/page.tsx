import Link from "next/link"
import {
  DownloadSimple,
  ChartBar,
  Users,
  Desktop,
  Warning,
} from "@phosphor-icons/react/dist/ssr"
import { prisma } from "@/lib/db"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function ReportsPage() {
  // eslint-disable-next-line react-hooks/purity
  const thirtyDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
  const [
    sessionsByPurpose,
    uniqueMembersLast30,
    topAssets,
    totalRepairCost,
    sessionsForHeatmap,
  ] = await Promise.all([
    prisma.usageSession.groupBy({
      by: ["purpose"],
      _count: { purpose: true },
    }),
    prisma.usageSession.findMany({
      where: {
        checkedOutAt: { gte: thirtyDaysAgo },
      },
      select: { personId: true },
      distinct: ["personId"],
    }),
    prisma.usageSession.groupBy({
      by: ["assetId"],
      _count: { assetId: true },
      orderBy: { _count: { assetId: "desc" } },
      take: 10,
    }),
    prisma.issue.aggregate({
      _sum: { repairCost: true },
    }),
    prisma.usageSession.findMany({
      select: { checkedOutAt: true },
    }),
  ])

  // Peak usage: 7 days × 24 hours grid of check-out counts
  const heatmap: number[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => 0)
  )
  for (const s of sessionsForHeatmap) {
    const d = new Date(s.checkedOutAt)
    heatmap[d.getDay()][d.getHours()] += 1
  }
  const maxHeat = Math.max(1, ...heatmap.flat())
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const assetIds = topAssets.map((a) => a.assetId)
  const topAssetDetails = await prisma.asset.findMany({
    where: { id: { in: assetIds } },
    select: { id: true, name: true },
  })
  const topAssetsWithNames = topAssets
    .map((t) => ({
      ...t,
      name: topAssetDetails.find((a) => a.id === t.assetId)?.name ?? "Unknown",
    }))

  const totalPurposeCount = sessionsByPurpose.reduce(
    (sum, p) => sum + p._count.purpose,
    0
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" />

      {/* Exports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Button
              variant="secondary"
              size="sm"
              render={<a href="/api/export/assets" download />}
            >
              <DownloadSimple size={14} className="mr-1" />
              Assets CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              render={<a href="/api/export/sessions" download />}
            >
              <DownloadSimple size={14} className="mr-1" />
              Sessions CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              render={<a href="/api/export/people" download />}
            >
              <DownloadSimple size={14} className="mr-1" />
              People CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              render={<a href="/api/export/issues" download />}
            >
              <DownloadSimple size={14} className="mr-1" />
              Issues CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sessions by purpose */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ChartBar size={18} weight="duotone" />
              Sessions by Purpose
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessionsByPurpose.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No session data yet.
              </p>
            ) : (
              <div className="space-y-3">
                {sessionsByPurpose
                  .sort((a, b) => b._count.purpose - a._count.purpose)
                  .map((p) => {
                    const pct = Math.round(
                      (p._count.purpose / totalPurposeCount) * 100
                    )
                    return (
                      <div key={p.purpose}>
                        <div className="flex justify-between text-xs mb-1">
                          <span>{p.purpose.replace(/_/g, " ")}</span>
                          <span className="text-muted-foreground">
                            {p._count.purpose} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Community served */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users size={18} weight="duotone" />
              Community Members Served
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{uniqueMembersLast30.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              unique people in the last 30 days
            </p>
          </CardContent>
        </Card>

        {/* Peak usage heatmap */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ChartBar size={18} weight="duotone" />
              Peak Usage (day × hour)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessionsForHeatmap.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No session data yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="text-xs">
                  <thead>
                    <tr>
                      <th className="pr-2 text-right text-muted-foreground font-normal"></th>
                      {Array.from({ length: 24 }).map((_, h) => (
                        <th
                          key={h}
                          className="px-0.5 text-muted-foreground font-normal w-5 text-center"
                        >
                          {h % 6 === 0 ? h : ""}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {heatmap.map((row, day) => (
                      <tr key={day}>
                        <td className="pr-2 text-right text-muted-foreground">
                          {dayLabels[day]}
                        </td>
                        {row.map((count, hour) => {
                          const intensity = count / maxHeat
                          return (
                            <td
                              key={hour}
                              title={`${dayLabels[day]} ${hour}:00 — ${count} check-out${count === 1 ? "" : "s"}`}
                              className="h-5 w-5 rounded-sm"
                              style={{
                                backgroundColor:
                                  count === 0
                                    ? "var(--muted)"
                                    : `color-mix(in oklch, var(--primary) ${Math.round(intensity * 100)}%, var(--muted))`,
                              }}
                            />
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-muted-foreground mt-2">
                  Darker = more check-outs. All-time data.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 10 assets */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Desktop size={18} weight="duotone" />
              Most-Used Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topAssetsWithNames.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No session data yet.
              </p>
            ) : (
              <ol className="space-y-2">
                {topAssetsWithNames.map((a, idx) => (
                  <li
                    key={a.assetId}
                    className="flex items-center justify-between py-1 text-sm"
                  >
                    <span>
                      <span className="inline-block w-6 text-muted-foreground">
                        {idx + 1}.
                      </span>
                      <Link
                        href={`/assets/${a.assetId}`}
                        className="font-medium hover:underline"
                      >
                        {a.name}
                      </Link>
                    </span>
                    <span className="text-muted-foreground">
                      {a._count.assetId} sessions
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        {/* Repair cost */}
        {totalRepairCost._sum.repairCost && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Warning size={18} weight="duotone" />
                Total Repair Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${totalRepairCost._sum.repairCost.toString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                across all issues with recorded cost
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
