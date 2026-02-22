"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronRight, ChevronDown, GripVertical } from "lucide-react"
import { cn } from "@repo/ui/utils"
import { ItemActionsMenu } from "./ItemActionsMenu"
import { StatusBadge } from "./StatusBadge"
import { prefixId, type Category } from "./taxonomy-dnd-utils"

interface CategoryRowProps {
  cat: Category
  isExpanded: boolean
  isHighlighted: boolean
  isDragSource: boolean
  onToggle: () => void
  onRename: () => void
  onDelete: () => void
  children: React.ReactNode
}

export function CategoryRow({
  cat,
  isExpanded,
  isHighlighted,
  isDragSource,
  onToggle,
  onRename,
  onDelete,
  children,
}: CategoryRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: prefixId("category", cat.id),
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          "group/row flex items-center gap-3 px-4 py-3 transition-colors",
          isDragSource && "opacity-30",
          isHighlighted && !isDragSource && "bg-accent/50 ring-1 ring-inset ring-primary/20",
          !isDragSource && !isHighlighted && "hover:bg-accent/50"
        )}
      >
        <button
          type="button"
          className="p-1 rounded text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button type="button" onClick={onToggle} className="p-0.5 rounded hover:bg-accent">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <span className="font-medium text-sm">{cat.name}</span>
        <code className="text-xs text-muted-foreground font-mono">{cat.code}</code>
        <StatusBadge status={cat.status} />
        <span className="ml-auto text-xs text-muted-foreground">{cat.subcategories.length} subcategories</span>
        <ItemActionsMenu onRename={onRename} onDelete={onDelete} />
      </div>
      {isExpanded && children}
    </div>
  )
}
