"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu"
import { ImageUp, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

interface ItemActionsMenuProps {
  onRename: () => void
  onDelete: () => void
  onUploadFlats?: () => void
}

export function ItemActionsMenu({ onRename, onDelete, onUploadFlats }: ItemActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="p-1 rounded text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent opacity-0 group-hover/row:opacity-100 focus:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {onUploadFlats && (
          <DropdownMenuItem onClick={onUploadFlats}>
            <ImageUp className="h-3.5 w-3.5" />
            Upload Flats
          </DropdownMenuItem>
        )}
        {onUploadFlats && <DropdownMenuSeparator />}
        <DropdownMenuItem onClick={onRename}>
          <Pencil className="h-3.5 w-3.5" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
