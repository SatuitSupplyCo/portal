'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from '@repo/ui/button'
import { Input } from '@repo/ui/input'
import { Label } from '@repo/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/dialog'

interface EditNameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  currentName: string
  /** Field label. Defaults to "Name". Pass "Label" for dimension values. */
  fieldLabel?: string
  onSave: (newName: string) => Promise<{ success: boolean; error?: string }>
}

export function EditNameDialog({
  open,
  onOpenChange,
  title,
  currentName,
  fieldLabel = 'Name',
  onSave,
}: EditNameDialogProps) {
  const [name, setName] = useState(currentName)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (open) {
      setName(currentName)
      setError(null)
    }
  }, [open, currentName])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const trimmed = name.trim()
    if (!trimmed) {
      setError(`${fieldLabel} is required.`)
      return
    }
    if (trimmed === currentName) {
      onOpenChange(false)
      return
    }
    startTransition(async () => {
      const result = await onSave(trimmed)
      if (!result.success) {
        setError(result.error ?? 'Something went wrong.')
      } else {
        onOpenChange(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">{fieldLabel}</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
