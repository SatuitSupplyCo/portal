'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { Button } from '@repo/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@repo/ui/dialog'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemName: string
  checkUsage: () => Promise<{ inUse: boolean; usageCount: number; usageDescription: string }>
  onDelete: () => Promise<{ success: true; action: 'deleted' | 'archived' } | { success: false; error: string }>
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemName,
  checkUsage,
  onDelete,
}: DeleteConfirmDialogProps) {
  const [usage, setUsage] = useState<{
    inUse: boolean
    usageCount: number
    usageDescription: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<'deleted' | 'archived' | null>(null)
  const [isPending, startTransition] = useTransition()

  const loadUsage = useCallback(async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const u = await checkUsage()
      setUsage(u)
    } catch {
      setError('Failed to check usage.')
    } finally {
      setLoading(false)
    }
  }, [checkUsage])

  useEffect(() => {
    if (open) {
      setUsage(null)
      setError(null)
      setResult(null)
      loadUsage()
    }
  }, [open, loadUsage])

  function handleConfirm() {
    startTransition(async () => {
      const res = await onDelete()
      if (!res.success) {
        setError(res.error)
      } else {
        setResult(res.action)
        setTimeout(() => onOpenChange(false), 1200)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {result ? (result === 'deleted' ? 'Deleted' : 'Archived') : `Remove "${itemName}"`}
          </DialogTitle>
          {!result && (
            <DialogDescription>
              {loading
                ? 'Checking usage...'
                : usage?.inUse
                  ? `This item is referenced by ${usage.usageDescription} and cannot be permanently deleted. It will be archived (deprecated) instead.`
                  : 'This item is not used anywhere and will be permanently deleted. This action cannot be undone.'}
            </DialogDescription>
          )}
        </DialogHeader>

        {result && (
          <p className="text-sm text-muted-foreground">
            {result === 'deleted'
              ? `"${itemName}" has been permanently deleted.`
              : `"${itemName}" has been archived (deprecated).`}
          </p>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {!result && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={usage?.inUse ? 'default' : 'destructive'}
              onClick={handleConfirm}
              disabled={isPending || loading}
            >
              {isPending
                ? 'Processing...'
                : usage?.inUse
                  ? 'Archive'
                  : 'Delete'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
