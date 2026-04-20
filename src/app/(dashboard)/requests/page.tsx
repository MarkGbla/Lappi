import Link from "next/link"
import { Plus } from "@phosphor-icons/react/dist/ssr"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth-helpers"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { FilterBar } from "@/components/shared/filter-bar"
import { RowActions } from "@/components/shared/row-actions"
import { deleteTechRequest } from "@/actions/requests"
import type { Prisma } from "@/generated/prisma/client"

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "DENIED", label: "Denied" },
  { value: "FULFILLED", label: "Fulfilled" },
]

const urgencyOptions = [
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
]

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; urgency?: string }>
}) {
  const session = await getSession()
  if (!session) return null

  const { status, urgency } = await searchParams

  const where: Prisma.TechRequestWhereInput = {}
  if (status) where.status = status as Prisma.TechRequestWhereInput["status"]
  if (urgency) where.urgency = urgency as Prisma.TechRequestWhereInput["urgency"]

  // Internal tool: all signed-in staff see every request.

  const requests = await prisma.techRequest.findMany({
    where,
    include: { requestedBy: true, reviewedBy: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  })

  const hasFilter = !!(status || urgency)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tech Requests"
        action={
          <Button size="sm" render={<Link href="/requests/new" />}>
            <Plus size={16} className="mr-1" />
            New Request
          </Button>
        }
      />

      <FilterBar
        fields={[
          { kind: "select", name: "status", placeholder: "All statuses", options: statusOptions },
          { kind: "select", name: "urgency", placeholder: "All urgencies", options: urgencyOptions },
        ]}
      />

      {requests.length === 0 ? (
        hasFilter ? (
          <EmptyState title="No requests match your filters" />
        ) : (
          <EmptyState
            title="No tech requests"
            description="Submit a request for equipment or resources, or wait for staff to file one."
            actionLabel="New Request"
            actionHref="/requests/new"
          />
        )
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            // Internal tool: every signed-in staff member can delete.
            const canDelete = true
            return (
              <div
                key={req.id}
                className="relative rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <Link href={`/requests/${req.id}`} className="block p-4 pr-12">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{req.title}</span>
                        <StatusBadge value={req.urgency} variant="urgency" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {req.description}
                      </p>
                      <div className="text-xs text-muted-foreground mt-2">
                        {req.requestedBy.firstName} {req.requestedBy.lastName} &middot;{" "}
                        {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <StatusBadge value={req.status} variant="requestStatus" />
                  </div>
                </Link>
                <div className="absolute top-3 right-3">
                  <RowActions
                    id={req.id}
                    itemName={req.title}
                    editHref={`/requests/${req.id}`}
                    onDelete={canDelete ? deleteTechRequest : undefined}
                    successMessage="Request deleted"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
