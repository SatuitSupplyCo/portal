import { GripVertical } from "lucide-react"
import { cn } from "@repo/ui/utils"
import type { ItemType } from "./taxonomy-dnd-utils"

interface DragOverlayRowProps {
  label: string
  code: string
  level: ItemType
}

export function DragOverlayRow({ label, code, level }: DragOverlayRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card px-4 shadow-lg",
        level === "category" ? "py-3" : "py-2.5"
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground/40" />
      <span className={cn("text-sm", level === "category" && "font-medium")}>{label}</span>
      <code className="text-xs text-muted-foreground font-mono">{code}</code>
    </div>
  )
}
