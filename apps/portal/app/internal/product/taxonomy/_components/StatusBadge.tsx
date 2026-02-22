import { Badge } from "@repo/ui/badge"

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "active") return null
  return (
    <Badge variant="secondary" className="text-[10px]">
      {status}
    </Badge>
  )
}
