'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@repo/ui/badge'
import { Button } from '@repo/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Sparkles } from 'lucide-react'
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
  intent: string | null
  designMandate: string | null
  brandingMandate: string | null
  systemRole: string | null
  contextBrief: string | null
  status: string
  sortOrder: number
}

export function CollectionsSection({ collections }: { collections: Collection[] }) {
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [strategyTarget, setStrategyTarget] = useState<Collection | null>(null)

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
            {col.contextBrief && (
              <span title="Has AI context brief">
                <Sparkles className="h-3 w-3 text-muted-foreground/40" />
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
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => setRenameTarget({ id: col.id, name: col.name })}>
                  <Pencil className="h-3.5 w-3.5" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStrategyTarget(col)}>
                  <Sparkles className="h-3.5 w-3.5" />
                  Edit Strategy
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

      {strategyTarget && (
        <CollectionStrategyDialog
          collection={strategyTarget}
          open={!!strategyTarget}
          onOpenChange={(open) => { if (!open) setStrategyTarget(null) }}
        />
      )}
    </div>
  )
}

// ─── Collection Strategy Dialog ──────────────────────────────────────

const STRATEGY_FIELDS = [
  { key: 'intent' as const, label: 'Intent', placeholder: 'Why does this collection exist?', rows: 2 },
  { key: 'designMandate' as const, label: 'Design Mandate', placeholder: 'Design direction and constraints...', rows: 2 },
  { key: 'brandingMandate' as const, label: 'Branding Mandate', placeholder: 'Branding constraints and requirements...', rows: 2 },
  { key: 'systemRole' as const, label: 'System Role', placeholder: 'Role in the broader assortment system...', rows: 2 },
] as const

function CollectionStrategyDialog({
  collection,
  open,
  onOpenChange,
}: {
  collection: Collection
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [values, setValues] = useState({
    intent: collection.intent ?? '',
    designMandate: collection.designMandate ?? '',
    brandingMandate: collection.brandingMandate ?? '',
    systemRole: collection.systemRole ?? '',
  })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateCollection(collection.id, values)
      if (result.success) {
        onOpenChange(false)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{collection.name} — Strategy</DialogTitle>
          <DialogDescription>
            Define collection strategy fields used by AI for assortment planning.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-5 min-h-0">
          {STRATEGY_FIELDS.map((field) => (
            <div key={field.key}>
              <label
                htmlFor={`strategy-${field.key}`}
                className="block text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground mb-1.5"
              >
                {field.label}
              </label>
              <textarea
                id={`strategy-${field.key}`}
                value={values[field.key]}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                rows={field.rows}
                placeholder={field.placeholder}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y"
              />
            </div>
          ))}

          {collection.contextBrief && (
            <div className="rounded-md border bg-muted/30 px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  AI Brief
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {collection.contextBrief}
              </p>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Strategy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
