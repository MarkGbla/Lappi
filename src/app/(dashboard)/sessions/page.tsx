import Link from "next/link"
import { SignOut } from "@phosphor-icons/react/dist/ssr"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { CheckInButton } from "@/components/sessions/checkin-button"
import { FilterBar } from "@/components/shared/filter-bar"
import { RowActions } from "@/components/shared/row-actions"
import { deleteSession } from "@/actions/sessions"
import type { Prisma } from "@/generated/prisma/client"

const purposeOptions = [
  { value: "WORKSHOP", label: "Workshop" },
  { value: "COHORT", label: "Cohort" },
  { value: "PERSONAL_LEARNING", label: "Personal Learning" },
  { value: "RESEARCH", label: "Research" },
  { value: "COMMUNITY_USE", label: "Community Use" },
  { value: "STAFF_WORK", label: "Staff Work" },
]

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    purpose?: string
    assetId?: string
    personId?: string
  }>
}) {
  const { purpose, assetId, personId } = await searchParams

  const historyFilter: Prisma.UsageSessionWhereInput = { checkedInAt: { not: null } }
  if (purpose) historyFilter.purpose = purpose as Prisma.UsageSessionWhereInput["purpose"]
  if (assetId) historyFilter.assetId = assetId
  if (personId) historyFilter.personId = personId

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()

  const [activeSessions, pastSessions, assets, people] = await Promise.all([
    prisma.usageSession.findMany({
      where: { checkedInAt: null },
      include: { asset: true, person: true, checkedOutBy: true },
      orderBy: { checkedOutAt: "desc" },
    }),
    prisma.usageSession.findMany({
      where: historyFilter,
      include: { asset: true, person: true },
      orderBy: { checkedOutAt: "desc" },
      take: 50,
    }),
    prisma.asset.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.person.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { lastName: "asc" },
    }),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sessions"
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" render={<Link href="/sessions/checkout/batch" />}>
              Batch
            </Button>
            <Button size="sm" render={<Link href="/sessions/checkout" />}>
              <SignOut size={16} className="mr-1" />
              New Check-Out
            </Button>
          </div>
        }
      />

      {/* Active Sessions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Active ({activeSessions.length})
        </h2>
        {activeSessions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center border border-border rounded-lg">
            No devices currently checked out.
          </p>
        ) : (
          <div className="space-y-3">
            {activeSessions.map((s) => {
              const hours = Math.round(
                (now - new Date(s.checkedOutAt).getTime()) / (1000 * 60 * 60)
              )
              const overdue = hours > 24 * 7
              return (
                <div
                  key={s.id}
                  className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4 ${
                    overdue ? "border-destructive/50 bg-destructive/5" : "border-border"
                  }`}
                >
                  <div>
                    <div className="font-medium">
                      {s.person.firstName} {s.person.lastName}
                      {overdue && (
                        <span className="ml-2 text-xs text-destructive font-medium">OVERDUE</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {s.asset.name} &middot; {s.purpose.replace(/_/g, " ")} &middot; {hours}h ago
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckInButton sessionId={s.id} assetName={s.asset.name} />
                    <RowActions
                      id={s.id}
                      itemName={`${s.asset.name} session`}
                      onDelete={deleteSession}
                      successMessage="Session deleted"
                      description="This removes the session and returns the asset to Available. Use Check In if the asset was actually returned."
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Session History */}
      <div>
        <h2 className="text-lg font-semibold mb-3">History</h2>
        <div className="mb-4">
          <FilterBar
            fields={[
              {
                kind: "select",
                name: "purpose",
                placeholder: "All purposes",
                options: purposeOptions,
              },
              {
                kind: "select",
                name: "assetId",
                placeholder: "All devices",
                options: assets.map((a) => ({ value: a.id, label: a.name })),
              },
              {
                kind: "select",
                name: "personId",
                placeholder: "All people",
                options: people.map((p) => ({
                  value: p.id,
                  label: `${p.firstName} ${p.lastName}`,
                })),
              },
            ]}
          />
        </div>
        {pastSessions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center border border-border rounded-lg">
            No past sessions match your filters.
          </p>
        ) : (
          <div className="space-y-2">
            {pastSessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <div className="text-sm font-medium">
                    {s.person.firstName} {s.person.lastName} — {s.asset.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {s.purpose.replace(/_/g, " ")} &middot;{" "}
                    {new Date(s.checkedOutAt).toLocaleDateString()} — {new Date(s.checkedInAt!).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {s.conditionOnReturn && (
                    <StatusBadge value={s.conditionOnReturn} variant="condition" />
                  )}
                  <RowActions
                    id={s.id}
                    itemName={`${s.asset.name} session`}
                    onDelete={deleteSession}
                    successMessage="Session deleted"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
