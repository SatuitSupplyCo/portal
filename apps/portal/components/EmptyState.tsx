import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  iconBgClass?: string
  iconColorClass?: string
  compact?: boolean
  children?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  iconBgClass = "bg-primary/10",
  iconColorClass = "text-primary",
  compact = false,
  children,
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center px-8 ${compact ? "py-20" : "py-24"}`}>
      <div className={`flex items-center justify-center rounded-2xl mb-6 ${iconBgClass} ${compact ? "h-14 w-14" : "h-16 w-16"}`}>
        <Icon className={`${iconColorClass} ${compact ? "h-7 w-7" : "h-8 w-8"}`} />
      </div>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        {description}
      </p>
      {children}
    </div>
  )
}
