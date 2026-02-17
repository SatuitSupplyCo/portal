'use client'

import { useState } from 'react'
import { Badge } from '@repo/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { AddItemDialog } from './AddItemDialog'
import { EditNameDialog } from './EditNameDialog'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import {
  createDimensionValue,
  updateDimensionValue,
  checkDimensionUsage,
  deleteDimensionValue,
} from '../actions'

interface DimensionItem {
  id: string
  code: string
  label: string
  description?: string | null
  status: string
  sortOrder: number
}

interface DimensionSectionProps {
  title: string
  dimensionKey: string
  items: DimensionItem[]
}

export function DimensionSection({ title, dimensionKey, items }: DimensionSectionProps) {
  const [renameTarget, setRenameTarget] = useState<{ id: string; label: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)

  const dimKey = dimensionKey as Parameters<typeof createDimensionValue>[0]

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <h3 className="font-medium text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground">{items.length} values</p>
        </div>
        <AddItemDialog
          title={`Add ${title} Value`}
          labelField
          onAdd={async (data) =>
            createDimensionValue(dimKey, {
              code: data.code,
              label: data.label,
              description: data.description,
            })
          }
        />
      </div>

      <div className="divide-y">
        {items.map((item) => (
          <div key={item.id} className="group/row flex items-center gap-3 px-4 py-2.5 text-sm">
            <span>{item.label}</span>
            <code className="text-xs text-muted-foreground/60 font-mono">{item.code}</code>
            {item.description && (
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {item.description}
              </span>
            )}
            {item.status !== 'active' && (
              <Badge variant="secondary" className="text-[10px]">
                {item.status}
              </Badge>
            )}
            <span className="ml-auto" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="p-1 rounded text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent opacity-0 group-hover/row:opacity-100 focus:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setRenameTarget({ id: item.id, label: item.label })}>
                  <Pencil className="h-3.5 w-3.5" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteTarget({ id: item.id, label: item.label })}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
        {items.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            No values defined.
          </div>
        )}
      </div>

      {renameTarget && (
        <EditNameDialog
          open={!!renameTarget}
          onOpenChange={(open) => { if (!open) setRenameTarget(null) }}
          title={`Rename ${title} Value`}
          currentName={renameTarget.label}
          fieldLabel="Label"
          onSave={async (newLabel) => updateDimensionValue(dimKey, renameTarget.id, { label: newLabel })}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
          itemName={deleteTarget.label}
          checkUsage={async () => checkDimensionUsage(dimKey, deleteTarget.id)}
          onDelete={async () => deleteDimensionValue(dimKey, deleteTarget.id)}
        />
      )}
    </div>
  )
}
