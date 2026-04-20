import { notFound } from "next/navigation"
import Link from "next/link"
import { PencilSimple } from "@phosphor-icons/react/dist/ssr"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/layout/page-header"
import { StatusBadge } from "@/components/shared/status-badge"

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      sessions: {
        include: { asset: true },
        orderBy: { checkedOutAt: "desc" },
        take: 20,
      },
    },
  })

  if (!person) notFound()

  const totalSessions = person.sessions.length
  const lastSession = person.sessions[0]

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${person.firstName} ${person.lastName}`}
        breadcrumbs={[
          { label: "People", href: "/people" },
          { label: `${person.firstName} ${person.lastName}` },
        ]}
        action={
          <Button variant="secondary" size="sm" render={<Link href={`/people/${person.id}/edit`} />}>
            <PencilSimple size={16} className="mr-1" />
            Edit
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase">Role</div>
              <div className="mt-1"><Badge variant="outline">{person.role}</Badge></div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase">Phone</div>
              <div className="mt-1 text-sm">{person.phone ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase">Email</div>
              <div className="mt-1 text-sm">{person.email ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase">Total Sessions</div>
              <div className="mt-1 text-sm font-medium">{totalSessions}</div>
            </div>
            {lastSession && (
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase">Last Active</div>
                <div className="mt-1 text-sm">{new Date(lastSession.checkedOutAt).toLocaleDateString()}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">Usage History</h2>
        {person.sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No usage sessions yet.</p>
        ) : (
          <div className="space-y-3">
            {person.sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <Link href={`/assets/${s.asset.id}`} className="text-sm font-medium hover:underline">
                    {s.asset.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {s.purpose.replace(/_/g, " ")} &middot; {new Date(s.checkedOutAt).toLocaleDateString()}
                    {s.checkedInAt ? ` — ${new Date(s.checkedInAt).toLocaleDateString()}` : ""}
                  </div>
                </div>
                {!s.checkedInAt ? (
                  <StatusBadge value="CHECKED_OUT" variant="status" />
                ) : s.conditionOnReturn ? (
                  <StatusBadge value={s.conditionOnReturn} variant="condition" />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
