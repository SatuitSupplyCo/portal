"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { cn } from "@repo/ui/utils"
import { ItemActionsMenu } from "./ItemActionsMenu"
import { StatusBadge } from "./StatusBadge"
import { prefixId, type ProductType } from "./taxonomy-dnd-utils"

interface ProductTypeRowProps {
  pt: ProductType
  isHighlighted: boolean
  isDragSource: boolean
  onOpenDetail: () => void
  onRename: () => void
  onDelete: () => void
  onUploadFlats: () => void
}

export function ProductTypeRow({
  pt,
  isHighlighted,
  isDragSource,
  onOpenDetail,
  onRename,
  onDelete,
  onUploadFlats,
}: ProductTypeRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: prefixId("productType", pt.id),
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/row flex items-center gap-3 px-4 py-2 pl-20 transition-colors cursor-pointer",
        isDragSource && "opacity-30",
        isHighlighted && !isDragSource && "bg-accent/40",
        !isDragSource && !isHighlighted && "hover:bg-accent/20"
      )}
      onClick={onOpenDetail}
    >
      <button
        type="button"
        className="p-1 rounded text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3 w-3" />
      </button>
      <span className="text-sm text-muted-foreground">{pt.name}</span>
      <code className="text-xs text-muted-foreground/60 font-mono">{pt.code}</code>
      <StatusBadge status={pt.status} />
      <span className="ml-auto" />
      <ItemActionsMenu
        onRename={onRename}
        onDelete={onDelete}
        onUploadFlats={onUploadFlats}
      />
    </div>
  )
}
