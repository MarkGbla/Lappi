import { Package } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type EmptyStateProps = {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-muted-foreground mb-4">
        {icon ?? <Package size={48} weight="thin" />}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Button className="mt-4" render={<Link href={actionHref} />}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
