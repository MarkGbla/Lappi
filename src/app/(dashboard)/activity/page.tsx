import { prisma } from "@/lib/db"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { FilterBar } from "@/components/shared/filter-bar"
import type { Prisma } from "@/generated/prisma/client"

const entityTypeOptions = [
  { value: "Asset", label: "Assets" },
  { value: "Person", label: "People" },
  { value: "UsageSession", label: "Sessions" },
  { value: "Issue", label: "Issues" },
  { value: "TechRequest", label: "Requests" },
]

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string; personId?: string }>
}) {
  const { entityType, personId } = await searchParams

  const where: Prisma.ActivityLogWhereInput = {}
  if (entityType) where.entityType = entityType
  if (personId) where.personId = personId

  const [logs, people] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: { person: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.person.findMany({
      where: { role: { in: ["ADMIN", "STAFF"] } },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
  ])

  const hasFilter = !!(entityType || personId)

  return (
    <div className="space-y-6">
      <PageHeader title="Activity Log" />

      <FilterBar
        fields={[
          {
            kind: "select",
            name: "entityType",
            placeholder: "All entities",
            options: entityTypeOptions,
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

      {logs.length === 0 ? (
        <EmptyState
          title={hasFilter ? "No activity matches your filters" : "No activity yet"}
          description={hasFilter ? undefined : "Actions will appear here as they happen."}
        />
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">
                    {log.person.firstName} {log.person.lastName}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    {log.action.replace(/_/g, " ").toLowerCase()}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {log.entityType} &middot; {log.entityId.substring(0, 8)}...
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
