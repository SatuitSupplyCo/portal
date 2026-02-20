'use client'

import { useState, useTransition, useMemo } from 'react'
import { Button } from '@repo/ui/button'
import { Input } from '@repo/ui/input'
import { Textarea } from '@repo/ui/textarea'
import { Label } from '@repo/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/select'
import { Plus } from 'lucide-react'
import { createSeason } from './actions'
import {
  useAiFieldSuggestions,
  AiFieldSuggestionsTrigger,
  AiFieldSuggestionsPanel,
} from '@/components/ai/AiFieldSuggestions'

interface CreateSeasonDialogProps {
  /** Pass custom trigger if you want a different button style */
  trigger?: React.ReactNode
  /** Pre-fetched brand brief for AI context */
  brandBrief?: string | null
}

export function CreateSeasonDialog({ trigger, brandBrief }: CreateSeasonDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [seasonType, setSeasonType] = useState<'major' | 'minor'>('major')

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [launchDate, setLaunchDate] = useState('')

  const aiContext = useMemo(
    () => ({ code, name, seasonType, launchDate: launchDate || undefined }),
    [code, name, seasonType, launchDate],
  )

  const aiEnabled = code.trim().length > 0 && name.trim().length > 0

  const ai = useAiFieldSuggestions({
    feature: 'field-suggestion',
    fieldName: 'description',
    fieldLabel: 'Description',
    context: aiContext,
    onSelect: setDescription,
    currentValue: description,
    brandBrief,
  })

  function handleSubmit(formData: FormData) {
    setError(null)

    const codeVal = (formData.get('code') as string)?.trim().toUpperCase()
    const nameVal = (formData.get('name') as string)?.trim()
    const descVal = description.trim() || undefined
    const launchDateStr = (formData.get('launchDate') as string)?.trim()
    const launchDateVal = launchDateStr ? new Date(launchDateStr) : undefined
    const type = formData.get('seasonType') as 'major' | 'minor'
    const targetSkuCount = parseInt(formData.get('targetSkuCount') as string, 10)
    const marginTarget = (formData.get('marginTarget') as string)?.trim() || undefined
    const complexityBudget = formData.get('complexityBudget')
      ? parseInt(formData.get('complexityBudget') as string, 10)
      : undefined
    const minorMaxSkus = formData.get('minorMaxSkus')
      ? parseInt(formData.get('minorMaxSkus') as string, 10)
      : undefined

    if (!codeVal) { setError('Season code is required.'); return }
    if (!nameVal) { setError('Season name is required.'); return }
    if (isNaN(targetSkuCount) || targetSkuCount < 1) {
      setError('Target slot count must be at least 1.')
      return
    }

    startTransition(async () => {
      const result = await createSeason({
        code: codeVal,
        name: nameVal,
        description: descVal,
        launchDate: launchDateVal,
        seasonType: type,
        targetSkuCount,
        marginTarget,
        complexityBudget,
        minorMaxSkus: type === 'minor' ? minorMaxSkus : undefined,
      })

      if (!result.success) {
        setError(result.error)
      } else {
        setOpen(false)
        setError(null)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4" />
            Add Season
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Season</DialogTitle>
          <DialogDescription>
            Add a new major season or minor drop to the assortment plan.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          {/* Season type */}
          <div className="space-y-2">
            <Label htmlFor="season-type">Type</Label>
            <Select
              name="seasonType"
              defaultValue="major"
              onValueChange={(v) => setSeasonType(v as 'major' | 'minor')}
            >
              <SelectTrigger id="season-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="major">Major Season</SelectItem>
                <SelectItem value="minor">Minor Drop</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Code + Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="season-code">Code</Label>
              <Input
                id="season-code"
                name="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="FW27"
                className="uppercase"
                maxLength={6}
                required
              />
              <p className="text-[10px] text-muted-foreground">Short code (e.g. FW27, SS28)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="season-name">Name</Label>
              <Input
                id="season-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Fall 2027"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="season-description">Description</Label>
              <AiFieldSuggestionsTrigger
                onClick={ai.fetchSuggestions}
                isLoading={ai.isLoading}
                disabled={!aiEnabled}
              />
            </div>
            <Textarea
              id="season-description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A coastal-inspired line anchored in sun-washed neutrals..."
              rows={2}
            />
            <AiFieldSuggestionsPanel
              suggestions={ai.suggestions}
              isLoading={ai.isLoading}
              isOpen={ai.isOpen}
              error={ai.error}
              onSelect={ai.handleSelect}
              onDismiss={ai.handleDismiss}
              onRegenerate={ai.handleRegenerate}
              onClearError={ai.clearError}
            />
            <p className="text-[10px] text-muted-foreground">Qualitative direction for the season</p>
          </div>

          {/* Launch date */}
          <div className="space-y-2">
            <Label htmlFor="season-launch-date">Launch Target Date</Label>
            <Input
              id="season-launch-date"
              name="launchDate"
              type="date"
              value={launchDate}
              onChange={(e) => setLaunchDate(e.target.value)}
            />
          </div>

          {/* Target SKU count */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="season-target">Target Slot Count</Label>
              <Input
                id="season-target"
                name="targetSkuCount"
                type="number"
                min={1}
                max={100}
                defaultValue={seasonType === 'major' ? 16 : 4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="season-margin">Margin Target %</Label>
              <Input
                id="season-margin"
                name="marginTarget"
                placeholder="65.00"
              />
            </div>
          </div>

          {/* Complexity budget */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="season-complexity">Complexity Budget</Label>
              <Input
                id="season-complexity"
                name="complexityBudget"
                type="number"
                min={1}
                placeholder="48"
              />
              <p className="text-[10px] text-muted-foreground">Sum of SKU complexity scores</p>
            </div>

            {/* Minor max SKUs — only visible for minor type */}
            {seasonType === 'minor' && (
              <div className="space-y-2">
                <Label htmlFor="season-minor-max">Hard Cap (Minor)</Label>
                <Input
                  id="season-minor-max"
                  name="minorMaxSkus"
                  type="number"
                  min={1}
                  max={20}
                  defaultValue={4}
                />
                <p className="text-[10px] text-muted-foreground">Max SKUs for this drop</p>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Season'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
