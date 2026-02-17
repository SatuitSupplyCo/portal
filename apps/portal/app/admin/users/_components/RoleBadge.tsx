import { Badge } from "@repo/ui/badge"

const ROLE_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  owner: { label: "Owner", variant: "default" },
  admin: { label: "Admin", variant: "default" },
  editor: { label: "Editor", variant: "secondary" },
  internal_viewer: { label: "Internal Viewer", variant: "outline" },
  partner_viewer: { label: "Partner Viewer", variant: "outline" },
  vendor_viewer: { label: "Vendor Viewer", variant: "outline" },
}

const PRODUCT_ROLE_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  founder: { label: "Founder", variant: "default" },
  product_lead: { label: "Product Lead", variant: "default" },
  studio_contributor: { label: "Studio Contributor", variant: "secondary" },
  external_designer: { label: "External Designer", variant: "secondary" },
  factory_partner: { label: "Factory Partner", variant: "outline" },
}

export function RoleBadge({ role }: { role: string }) {
  const config = ROLE_CONFIG[role] ?? {
    label: role,
    variant: "outline" as const,
  }

  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function ProductRoleBadge({ role }: { role: string | null }) {
  if (!role) {
    return <span className="text-sm text-muted-foreground">—</span>
  }

  const config = PRODUCT_ROLE_CONFIG[role] ?? {
    label: role,
    variant: "outline" as const,
  }

  return <Badge variant={config.variant}>{config.label}</Badge>
}
