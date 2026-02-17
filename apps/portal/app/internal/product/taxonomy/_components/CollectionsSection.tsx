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
  createCollection,
  updateCollection,
  checkCollectionUsage,
  deleteCollection,
} from '../actions'

interface Collection {
  id: string
  code: string
  name: string
  description: string | null
  status: string
  sortOrder: number
}

export function CollectionsSection({ collections }: { collections: Collection[] }) {
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Collections</h2>
        <AddItemDialog
          title="Add Collection"
          onAdd={async (data) =>
            createCollection({ code: data.code, name: data.label, description: data.description })
          }
        />
      </div>

      <div className="rounded-lg border bg-card shadow-sm divide-y">
        {collections.map((col) => (
          <div key={col.id} className="group/row flex items-center gap-3 px-4 py-3">
            <span className="font-medium text-sm">{col.name}</span>
            <code className="text-xs text-muted-foreground font-mono">{col.code}</code>
            {col.description && (
              <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                {col.description}
              </span>
            )}
            {col.status !== 'active' && (
              <Badge variant="secondary" className="text-[10px]">
                {col.status}
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
                <DropdownMenuItem onClick={() => setRenameTarget({ id: col.id, name: col.name })}>
                  <Pencil className="h-3.5 w-3.5" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteTarget({ id: col.id, name: col.name })}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
        {collections.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No collections defined yet.
          </div>
        )}
      </div>

      {renameTarget && (
        <EditNameDialog
          open={!!renameTarget}
          onOpenChange={(open) => { if (!open) setRenameTarget(null) }}
          title="Rename Collection"
          currentName={renameTarget.name}
          onSave={async (newName) => updateCollection(renameTarget.id, { name: newName })}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
          itemName={deleteTarget.name}
          checkUsage={async () => checkCollectionUsage(deleteTarget.id)}
          onDelete={async () => deleteCollection(deleteTarget.id)}
        />
      )}
    </div>
  )
}
