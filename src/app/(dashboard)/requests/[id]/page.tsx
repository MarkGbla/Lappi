import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth-helpers"
import { PageHeader } from "@/components/layout/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { RequestReviewActions } from "@/components/requests/request-actions"

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()
  if (!session) return null

  const request = await prisma.techRequest.findUnique({
    where: { id },
    include: { requestedBy: true, reviewedBy: true },
  })
  if (!request) notFound()

  // Internal tool: every signed-in staff can view any request and take
  // admin actions on it.

  return (
    <div className="space-y-6">
      <PageHeader
        title={request.title}
        breadcrumbs={[
          { label: "Requests", href: "/requests" },
          { label: request.title.substring(0, 40) },
        ]}
      />

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={request.status} variant="requestStatus" />
            <StatusBadge value={request.urgency} variant="urgency" />
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Description
            </h3>
            <p className="text-sm whitespace-pre-wrap">{request.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">Requested by</div>
              <div>
                {request.requestedBy.firstName} {request.requestedBy.lastName}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Submitted</div>
              <div>{new Date(request.createdAt).toLocaleString()}</div>
            </div>
            {request.reviewedBy && (
              <>
                <div>
                  <div className="text-muted-foreground text-xs">Reviewed by</div>
                  <div>
                    {request.reviewedBy.firstName} {request.reviewedBy.lastName}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Reviewed</div>
                  <div>
                    {request.reviewedAt
                      ? new Date(request.reviewedAt).toLocaleString()
                      : "—"}
                  </div>
                </div>
              </>
            )}
          </div>

          {request.reviewNotes && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Review notes
              </h3>
              <p className="text-sm whitespace-pre-wrap">{request.reviewNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <RequestReviewActions requestId={request.id} status={request.status} />
    </div>
  )
}
