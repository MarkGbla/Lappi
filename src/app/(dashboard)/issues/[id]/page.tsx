import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { IssueActions } from "@/components/issues/issue-actions"

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const issue = await prisma.issue.findUnique({
    where: { id },
    include: { asset: true, reportedBy: true, assignedTo: true },
  })

  if (!issue) notFound()

  const [staff, timeline] = await Promise.all([
    prisma.person.findMany({
      where: { role: { in: ["ADMIN", "STAFF"] }, isActive: true },
      select: { id: true, firstName: true, lastName: true },
    }),
    prisma.activityLog.findMany({
      where: { entityType: "Issue", entityId: id },
      include: { person: true },
      orderBy: { createdAt: "asc" },
    }),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title={issue.title}
        breadcrumbs={[
          { label: "Issues", href: "/issues" },
          { label: issue.title },
        ]}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase">Status</div>
              <div className="mt-1"><StatusBadge value={issue.status} variant="issueStatus" /></div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase">Severity</div>
              <div className="mt-1"><StatusBadge value={issue.severity} variant="severity" /></div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase">Asset</div>
              <div className="mt-1 text-sm">
                <Link href={`/assets/${issue.asset.id}`} className="hover:underline">{issue.asset.name}</Link>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase">Reported By</div>
              <div className="mt-1 text-sm">{issue.reportedBy.firstName} {issue.reportedBy.lastName}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase">Assigned To</div>
              <div className="mt-1 text-sm">
                {issue.assignedTo
                  ? `${issue.assignedTo.firstName} ${issue.assignedTo.lastName}`
                  : "Unassigned"}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase">Reported</div>
              <div className="mt-1 text-sm">{new Date(issue.createdAt).toLocaleDateString()}</div>
            </div>
            {issue.resolvedAt && (
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase">Resolved</div>
                <div className="mt-1 text-sm">{new Date(issue.resolvedAt).toLocaleDateString()}</div>
              </div>
            )}
            {issue.repairCost && (
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase">Repair Cost</div>
                <div className="mt-1 text-sm">${issue.repairCost.toString()}</div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs font-medium text-muted-foreground uppercase mb-1">Description</div>
            <p className="text-sm whitespace-pre-wrap">{issue.description}</p>
          </div>

          {issue.resolutionNotes && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs font-medium text-muted-foreground uppercase mb-1">Resolution Notes</div>
              <p className="text-sm whitespace-pre-wrap">{issue.resolutionNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <IssueActions
        issueId={issue.id}
        currentStatus={issue.status}
        currentAssigneeId={issue.assignedToId}
        staff={staff.map((s) => ({ id: s.id, name: `${s.firstName} ${s.lastName}` }))}
      />

      {timeline.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold mb-4">Timeline</h3>
            <ol className="space-y-3 border-l-2 border-border pl-4">
              {timeline.map((log) => {
                const meta = log.metadata as Record<string, unknown> | null
                return (
                  <li key={log.id} className="relative">
                    <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                    <div className="text-sm">
                      <span className="font-medium">
                        {log.person.firstName} {log.person.lastName}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {formatAction(log.action, meta)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </li>
                )
              })}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function formatAction(action: string, meta: Record<string, unknown> | null) {
  switch (action) {
    case "ISSUE_REPORTED":
      return `reported this issue (${meta?.severity ?? ""})`
    case "ISSUE_ASSIGNED":
      return "assigned the issue"
    case "ISSUE_STATUS_CHANGED": {
      const status = typeof meta?.status === "string" ? meta.status : ""
      return `changed status to ${status.replace(/_/g, " ").toLowerCase()}`
    }
    default:
      return action.replace(/_/g, " ").toLowerCase()
  }
}
