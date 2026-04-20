type SessionLike = {
  checkedOutAt: Date
  checkedInAt: Date | null
}

type IssueLike = {
  severity: string
  status: string
  createdAt: Date
}

type AssetLike = {
  createdAt: Date
  condition: string
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

/**
 * % of days since the asset was registered that it was checked out.
 * Uses capped lifetime: min(lifetime, 180d) so early assets don't skew.
 */
export function utilisationRate(
  asset: AssetLike,
  sessions: SessionLike[],
  now: Date
): number {
  const lifetimeMs = Math.max(now.getTime() - asset.createdAt.getTime(), MS_PER_DAY)
  const windowMs = Math.min(lifetimeMs, 180 * MS_PER_DAY)

  const usedMs = sessions.reduce((total, s) => {
    const start = Math.max(s.checkedOutAt.getTime(), now.getTime() - windowMs)
    const end = (s.checkedInAt ?? now).getTime()
    return total + Math.max(0, end - start)
  }, 0)

  return Math.min(100, Math.round((usedMs / windowMs) * 100))
}

/**
 * 0-100 composite health score.
 * Starts at 100, deducted by:
 * - condition (Excellent 0, Good 10, Fair 25, Poor 50)
 * - open issues (each Critical 20, High 10, Medium 5, Low 2, capped at 40)
 * - age (1 point per 6 months, capped at 20)
 */
export function healthScore(
  asset: AssetLike,
  issues: IssueLike[],
  now: Date
): number {
  const conditionPenalty: Record<string, number> = {
    EXCELLENT: 0,
    GOOD: 10,
    FAIR: 25,
    POOR: 50,
  }
  const severityPenalty: Record<string, number> = {
    CRITICAL: 20,
    HIGH: 10,
    MEDIUM: 5,
    LOW: 2,
  }

  const openIssues = issues.filter(
    (i) => i.status === "OPEN" || i.status === "IN_PROGRESS"
  )
  const issuePenalty = Math.min(
    40,
    openIssues.reduce((sum, i) => sum + (severityPenalty[i.severity] ?? 0), 0)
  )

  const ageMonths =
    (now.getTime() - asset.createdAt.getTime()) / (MS_PER_DAY * 30)
  const agePenalty = Math.min(20, Math.floor(ageMonths / 6))

  const score = 100 - (conditionPenalty[asset.condition] ?? 0) - issuePenalty - agePenalty
  return Math.max(0, score)
}

export function healthLabel(score: number): {
  label: string
  colour: string
} {
  if (score >= 80) return { label: "Healthy", colour: "text-green-600 dark:text-green-400" }
  if (score >= 60) return { label: "Fair", colour: "text-amber-600 dark:text-amber-400" }
  if (score >= 40) return { label: "Declining", colour: "text-orange-600 dark:text-orange-400" }
  return { label: "At Risk", colour: "text-red-600 dark:text-red-400" }
}
