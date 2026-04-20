import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const statusStyles: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  CHECKED_OUT: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  MAINTENANCE: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  NEEDS_ATTENTION: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  RETIRED: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400",
}

const severityStyles: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  LOW: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
}

const issueStatusStyles: Record<string, string> = {
  OPEN: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  IN_PROGRESS: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  RESOLVED: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  CLOSED: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400",
}

const urgencyStyles: Record<string, string> = {
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  LOW: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
}

const requestStatusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  DENIED: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  FULFILLED: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
}

const conditionStyles: Record<string, string> = {
  EXCELLENT: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  GOOD: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  FAIR: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  POOR: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
}

type StatusBadgeProps = {
  value: string
  variant?:
    | "status"
    | "severity"
    | "issueStatus"
    | "requestStatus"
    | "urgency"
    | "condition"
}

const styleMap = {
  status: statusStyles,
  severity: severityStyles,
  issueStatus: issueStatusStyles,
  requestStatus: requestStatusStyles,
  urgency: urgencyStyles,
  condition: conditionStyles,
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

export function StatusBadge({ value, variant = "status" }: StatusBadgeProps) {
  const styles = styleMap[variant]
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-0 font-medium text-xs",
        styles[value] ?? "bg-muted text-muted-foreground"
      )}
    >
      {formatLabel(value)}
    </Badge>
  )
}
