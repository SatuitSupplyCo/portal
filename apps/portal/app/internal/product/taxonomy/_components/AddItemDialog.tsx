'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@repo/ui/button'
import { Input } from '@repo/ui/input'
import { Label } from '@repo/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/dialog'
import { Plus } from 'lucide-react'

interface AddItemDialogProps {
  title: string
  /** Called with { code, name/label, description? } on submit */
  onAdd: (data: { code: string; label: string; description?: string }) => Promise<{ success: boolean; error?: string }>
  /** Use "label" instead of "name" in the form */
  labelField?: boolean
  trigger?: React.ReactNode
}

export function AddItemDialog({ title, onAdd, labelField, trigger }: AddItemDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError(null)
    const code = (formData.get('code') as string)?.trim()
    const label = (formData.get('label') as string)?.trim()
    const description = (formData.get('description') as string)?.trim() || undefined

    if (!code) { setError('Code is required.'); return }
    if (!label) { setError(`${labelField ? 'Label' : 'Name'} is required.`); return }

    startTransition(async () => {
      const result = await onAdd({ code, label, description })
      if (!result.success) {
        setError(result.error ?? 'Something went wrong.')
      } else {
        setOpen(false)
        setError(null)
        router.refresh()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline">
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="item-code">Code</Label>
            <Input id="item-code" name="code" placeholder="e.g. fleece_pullover" />
            <p className="text-[10px] text-muted-foreground">
              Unique identifier. Lowercase, underscores only.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-label">{labelField ? 'Label' : 'Name'}</Label>
            <Input id="item-label" name="label" placeholder={labelField ? 'Display label' : 'Display name'} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-desc">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input id="item-desc" name="description" placeholder="Short description" />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Adding...' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
