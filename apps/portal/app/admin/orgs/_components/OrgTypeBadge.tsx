import { Badge } from "@repo/ui/badge"

const TYPE_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  vendor: { label: "Vendor", variant: "secondary" },
  partner: { label: "Partner", variant: "default" },
}

export function OrgTypeBadge({ type }: { type: string }) {
  const config = TYPE_CONFIG[type] ?? {
    label: type,
    variant: "outline" as const,
  }

  return (
    <Badge variant={config.variant} className="capitalize">
      {config.label}
    </Badge>
  )
}
