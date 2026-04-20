import {
  Desktop,
  SignOut,
  SignIn,
  Warning,
  User,
  ClipboardText,
  CircleDashed,
} from "@phosphor-icons/react/dist/ssr"
import type { Icon } from "@phosphor-icons/react"

const iconMap: Record<string, Icon> = {
  ASSET_CREATED: Desktop,
  ASSET_UPDATED: Desktop,
  ASSET_RETIRED: Desktop,
  SESSION_STARTED: SignOut,
  SESSION_ENDED: SignIn,
  ISSUE_REPORTED: Warning,
  ISSUE_ASSIGNED: Warning,
  ISSUE_STATUS_CHANGED: Warning,
  PERSON_CREATED: User,
  PERSON_UPDATED: User,
  PERSON_DEACTIVATED: User,
  PERSON_REACTIVATED: User,
  REQUEST_CREATED: ClipboardText,
  REQUEST_APPROVED: ClipboardText,
  REQUEST_DENIED: ClipboardText,
  REQUEST_FULFILLED: ClipboardText,
}

const verbMap: Record<string, string> = {
  ASSET_CREATED: "added",
  ASSET_UPDATED: "updated",
  ASSET_RETIRED: "retired",
  SESSION_STARTED: "checked out",
  SESSION_ENDED: "checked in",
  ISSUE_REPORTED: "reported an issue",
  ISSUE_ASSIGNED: "assigned an issue",
  ISSUE_STATUS_CHANGED: "updated issue status",
  PERSON_CREATED: "added",
  PERSON_UPDATED: "edited",
  PERSON_DEACTIVATED: "deactivated",
  PERSON_REACTIVATED: "reactivated",
  REQUEST_CREATED: "submitted a request",
  REQUEST_APPROVED: "approved a request",
  REQUEST_DENIED: "denied a request",
  REQUEST_FULFILLED: "fulfilled a request",
}

export function ActivityIcon({
  action,
  size = 14,
  className = "text-muted-foreground",
}: {
  action: string
  size?: number
  className?: string
}) {
  const Component = iconMap[action] ?? CircleDashed
  return <Component size={size} weight="regular" className={className} />
}

export function formatActionVerb(action: string): string {
  return verbMap[action] ?? action.replace(/_/g, " ").toLowerCase()
}
