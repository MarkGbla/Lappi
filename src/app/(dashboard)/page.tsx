import Link from "next/link"
import {
  Desktop,
  ArrowsLeftRight,
  Warning,
  Users,
  SignOut,
  Plus,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr"
import type { Icon } from "@phosphor-icons/react"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  ActivityIcon,
  formatActionVerb,
} from "@/components/shared/activity-icon"
import { cn } from "@/lib/utils"

export default async function DashboardPage() {
  const [
    totalAssets,
    availableCount,
    checkedOutCount,
    maintenanceCount,
    activeSessions,
    openIssues,
    criticalCount,
    peopleByRole,
    recentActivity,
    attentionAssets,
  ] = await Promise.all([
    prisma.asset.count({ where: { status: { not: "RETIRED" } } }),
    prisma.asset.count({ where: { status: "AVAILABLE" } }),
    prisma.asset.count({ where: { status: "CHECKED_OUT" } }),
    prisma.asset.count({
      where: { status: { in: ["MAINTENANCE", "NEEDS_ATTENTION"] } },
    }),
    prisma.usageSession.count({ where: { checkedInAt: null } }),
    prisma.issue.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.issue.count({
      where: {
        severity: "CRITICAL",
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
    }),
    prisma.person.groupBy({
      by: ["role"],
      where: { isActive: true },
      _count: { role: true },
    }),
    prisma.activityLog.findMany({
      include: { person: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.asset.findMany({
      where: { status: { in: ["MAINTENANCE", "NEEDS_ATTENTION"] } },
      take: 5,
    }),
  ])

  const totalPeople = peopleByRole.reduce((sum, r) => sum + r._count.role, 0)
  const memberCount =
    peopleByRole.find((r) => r.role === "MEMBER")?._count.role ?? 0
  const staffCount =
    peopleByRole.find((r) => r.role === "STAFF")?._count.role ?? 0
  const adminCount =
    peopleByRole.find((r) => r.role === "ADMIN")?._count.role ?? 0

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" eyebrow="Overview" />

      {/* KPI cards */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          href="/assets"
          icon={Desktop}
          label="Assets"
          value={totalAssets}
          breakdown={`${availableCount} available · ${checkedOutCount} checked out · ${maintenanceCount} repair`}
        />
        <KpiCard
          href="/sessions"
          icon={ArrowsLeftRight}
          label="Active Sessions"
          value={activeSessions}
          breakdown={`${activeSessions === 1 ? "device" : "devices"} in the field`}
        />
        <KpiCard
          href="/issues"
          icon={Warning}
          label="Open Issues"
          value={openIssues}
          breakdown={
            criticalCount > 0
              ? `${criticalCount} critical · needs attention`
              : "none critical"
          }
          emphasised={criticalCount > 0}
        />
        <KpiCard
          href="/people"
          icon={Users}
          label="People"
          value={totalPeople}
          breakdown={`${memberCount} members · ${staffCount} staff · ${adminCount} admin`}
        />
      </section>

      {/* Quick actions tray */}
      <section className="rounded-xl bg-muted/40 ring-1 ring-foreground/10 p-4 sm:p-5">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Quick actions
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" render={<Link href="/sessions/checkout" />}>
            <SignOut size={14} className="mr-1.5" />
            New Check-Out
          </Button>
          <Button
            size="sm"
            variant="secondary"
            render={<Link href="/issues/new" />}
          >
            <Warning size={14} className="mr-1.5" />
            Report Issue
          </Button>
          <Button
            size="sm"
            variant="secondary"
            render={<Link href="/assets/new" />}
          >
            <Plus size={14} className="mr-1.5" />
            Add Asset
          </Button>
        </div>
      </section>

      {/* Two-column section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Recent activity (wider) */}
        <SectionCard
          className="lg:col-span-3"
          title="Recent activity"
          rightSlot={
            <Link
              href="/activity"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              View all
              <ArrowUpRight size={12} />
            </Link>
          }
        >
          {recentActivity.length === 0 ? (
            <EmptyRow text="No activity yet." />
          ) : (
            <ul className="divide-y divide-border/60">
              {recentActivity.map((log) => {
                const meta = log.metadata as Record<string, unknown> | null
                const subjectName =
                  typeof meta?.name === "string" ? meta.name : null
                const initials =
                  `${log.person.firstName[0] ?? ""}${log.person.lastName[0] ?? ""}`.toUpperCase()
                return (
                  <li
                    key={log.id}
                    className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                      {initials || "·"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-sm leading-snug">
                        <ActivityIcon action={log.action} size={13} />
                        <span className="text-foreground">
                          <span className="font-medium">
                            {log.person.firstName} {log.person.lastName}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            {formatActionVerb(log.action)}
                          </span>
                          {subjectName && (
                            <>
                              {" "}
                              <span className="font-medium">{subjectName}</span>
                            </>
                          )}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                        {formatRelative(log.createdAt)}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </SectionCard>

        {/* Needs attention (narrower) */}
        <SectionCard
          className="lg:col-span-2"
          title="Needs attention"
          rightSlot={
            attentionAssets.length > 0 ? (
              <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                {attentionAssets.length}
              </span>
            ) : null
          }
        >
          {attentionAssets.length === 0 ? (
            <EmptyRow text="All clear. Every device is in good shape." />
          ) : (
            <ul className="divide-y divide-border/60">
              {attentionAssets.map((asset) => (
                <li key={asset.id}>
                  <Link
                    href={`/assets/${asset.id}`}
                    className="group flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 -mx-1 px-1 rounded-md hover:bg-muted/40 transition-colors"
                  >
                    <span
                      aria-hidden
                      className="inline-block size-2 shrink-0 rounded-full bg-amber-500"
                    />
                    <span className="flex-1 text-sm font-medium text-foreground truncate">
                      {asset.name}
                    </span>
                    <StatusBadge value={asset.status} variant="status" />
                    <ArrowUpRight
                      size={12}
                      className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────── */

function KpiCard({
  href,
  icon: IconComponent,
  label,
  value,
  breakdown,
  emphasised = false,
}: {
  href: string
  icon: Icon
  label: string
  value: number
  breakdown: string
  emphasised?: boolean
}) {
  return (
    <Link
      href={href}
      className="group relative block rounded-xl bg-card ring-1 ring-foreground/10 p-4 sm:p-5 transition-all duration-200 hover:ring-foreground/25 hover:-translate-y-px hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <span className="grid size-8 place-items-center rounded-md bg-muted/70 text-foreground/70">
          <IconComponent size={16} weight="regular" />
        </span>
        <ArrowUpRight
          size={14}
          className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
      <div className="mt-4 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-3xl font-semibold tracking-tight tabular-nums",
          emphasised ? "text-destructive" : "text-foreground"
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground tabular-nums truncate">
        {breakdown}
      </div>
    </Link>
  )
}

function SectionCard({
  title,
  rightSlot,
  className,
  children,
}: {
  title: string
  rightSlot?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      className={cn(
        "rounded-xl bg-card ring-1 ring-foreground/10 p-4 sm:p-5",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {rightSlot}
      </div>
      {children}
    </section>
  )
}

function EmptyRow({ text }: { text: string }) {
  return (
    <p className="text-sm text-muted-foreground py-6 text-center">{text}</p>
  )
}

function formatRelative(d: Date): string {
  const now = Date.now()
  const diff = now - new Date(d).getTime()
  const min = Math.round(diff / 60000)
  if (min < 1) return "just now"
  if (min < 60) return `${min}m ago`
  const h = Math.round(min / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.round(h / 24)
  if (days < 7) return `${days}d ago`
  return new Date(d).toLocaleDateString()
}
