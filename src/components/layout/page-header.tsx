import Link from "next/link"

type Breadcrumb = {
  label: string
  href?: string
}

type PageHeaderProps = {
  title: string
  eyebrow?: string
  breadcrumbs?: Breadcrumb[]
  action?: React.ReactNode
}

export function PageHeader({ title, eyebrow, breadcrumbs, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="opacity-40" aria-hidden>/</span>}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && (
          <div className="mb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
