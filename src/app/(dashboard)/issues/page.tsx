import Link from "next/link"
import { Plus } from "@phosphor-icons/react/dist/ssr"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { FilterBar } from "@/components/shared/filter-bar"
import { Pagination } from "@/components/shared/pagination"
import { RowActions } from "@/components/shared/row-actions"
import { deleteIssue } from "@/actions/issues"
import type { Prisma } from "@/generated/prisma/client"

const statusOptions = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
]

const severityOptions = [
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
]

const PAGE_SIZE = 25

export default async function IssuesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string
    severity?: string
    assetId?: string
    assigneeId?: string
    page?: string
  }>
}) {
  const params = await searchParams
  const { status, severity, assetId, assigneeId } = params
  const page = Math.max(1, Number(params.page) || 1)

  const where: Prisma.IssueWhereInput = {}
  if (status) where.status = status as Prisma.IssueWhereInput["status"]
  if (severity) where.severity = severity as Prisma.IssueWhereInput["severity"]
  if (assetId) where.assetId = assetId
  if (assigneeId) where.assignedToId = assigneeId

  const [issues, totalCount, assets, staff] = await Promise.all([
    prisma.issue.findMany({
      where,
      include: { asset: true, reportedBy: true, assignedTo: true },
      orderBy: [{ status: "asc" }, { severity: "desc" }, { createdAt: "desc" }],
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.issue.count({ where }),
    prisma.asset.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.person.findMany({
      where: { role: { in: ["ADMIN", "STAFF"] }, isActive: true },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
  ])

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const hasFilter = !!(status || severity || assetId || assigneeId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issues"
        action={
          <Button size="sm" render={<Link href="/issues/new" />}>
            <Plus size={16} className="mr-1" />
            Report Issue
          </Button>
        }
      />

      <FilterBar
        fields={[
          { kind: "select", name: "status", placeholder: "All statuses", options: statusOptions },
          { kind: "select", name: "severity", placeholder: "All severities", options: severityOptions },
          {
            kind: "select",
            name: "assetId",
            placeholder: "All devices",
            options: assets.map((a) => ({ value: a.id, label: a.name })),
          },
          {
            kind: "select",
            name: "assigneeId",
            placeholder: "All assignees",
            options: staff.map((s) => ({
              value: s.id,
              label: `${s.firstName} ${s.lastName}`,
            })),
          },
        ]}
      />

      {issues.length === 0 ? (
        hasFilter ? (
          <EmptyState title="No issues match your filters" />
        ) : (
          <EmptyState
            title="No issues reported"
            description="All devices are running smoothly."
            actionLabel="Report Issue"
            actionHref="/issues/new"
          />
        )
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="relative rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <Link
                href={`/issues/${issue.id}`}
                className="flex flex-col gap-2 p-4 pr-12 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{issue.title}</span>
                    {issue.source === "PUBLIC" && (
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                        Public
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {issue.asset.name} &middot; Reported by{" "}
                    {issue.source === "PUBLIC"
                      ? "Community Reporter (QR scan)"
                      : `${issue.reportedBy.firstName} ${issue.reportedBy.lastName}`}
                    {issue.assignedTo && (
                      <> &middot; Assigned to {issue.assignedTo.firstName} {issue.assignedTo.lastName}</>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge value={issue.severity} variant="severity" />
                  <StatusBadge value={issue.status} variant="issueStatus" />
                </div>
              </Link>
              <div className="absolute top-3 right-3">
                <RowActions
                  id={issue.id}
                  itemName={issue.title}
                  editHref={`/issues/${issue.id}`}
                  onDelete={deleteIssue}
                  successMessage="Issue deleted"
                />
              </div>
            </div>
          ))}
          <Pagination page={page} pageCount={pageCount} />
        </div>
      )}
    </div>
  )
}
