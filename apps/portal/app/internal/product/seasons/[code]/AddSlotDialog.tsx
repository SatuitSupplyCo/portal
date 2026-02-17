'use client'

import { useState, useTransition } from 'react'
import { Button } from '@repo/ui/button'
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/select'
import { Plus } from 'lucide-react'
import { createSeasonSlot } from '../../actions'
import { SlotColorPicker, type ColorOption } from './SlotColorPicker'

// ─── Types ──────────────────────────────────────────────────────────

export interface TaxonomySubcategory {
  id: string
  code: string
  name: string
  productTypes: Array<{
    id: string
    code: string
    name: string
  }>
}

export interface TaxonomyCategory {
  id: string
  code: string
  name: string
  subcategories: TaxonomySubcategory[]
}

export interface TaxonomyDimension {
  id: string
  code: string
  label: string
}

export interface AddSlotDialogProps {
  seasonId: string
  seasonName: string
  productHierarchy: TaxonomyCategory[]
  collections: TaxonomyDimension[]
  constructions: TaxonomyDimension[]
  weightClasses: TaxonomyDimension[]
  fitBlocks: TaxonomyDimension[]
  sizeScales: TaxonomyDimension[]
  useCases: TaxonomyDimension[]
  audienceGenders: TaxonomyDimension[]
  audienceAgeGroups: TaxonomyDimension[]
  sellingWindows: TaxonomyDimension[]
  assortmentTenures: TaxonomyDimension[]
  colorOptions: ColorOption[]
  seasonColorIds: string[]
  proposedColorIds: string[]
}

// ─── Helpers ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--depot-faint)] mb-3 pt-1"
      style={{ fontFamily: 'var(--depot-font)' }}
    >
      {children}
    </p>
  )
}

function FieldLabel({ htmlFor, children, optional }: { htmlFor: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <Label
      htmlFor={htmlFor}
      className="text-[11px] font-medium text-[var(--depot-ink-light)]"
      style={{ fontFamily: 'var(--depot-font)' }}
    >
      {children}
      {optional && (
        <span className="text-[var(--depot-faint)] font-normal ml-1">
          (optional)
        </span>
      )}
    </Label>
  )
}

function DimensionSelect({
  id,
  name,
  placeholder,
  options,
  defaultValue,
  required,
}: {
  id: string
  name: string
  placeholder: string
  options: TaxonomyDimension[]
  defaultValue?: string
  required?: boolean
}) {
  return (
    <Select name={name} defaultValue={defaultValue} required={required}>
      <SelectTrigger id={id} className="h-8 text-[12px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id} className="text-[12px]">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// ─── Component ──────────────────────────────────────────────────────

export function AddSlotDialog({
  seasonId,
  seasonName,
  productHierarchy,
  collections,
  constructions,
  weightClasses,
  fitBlocks,
  sizeScales,
  useCases,
  audienceGenders,
  audienceAgeGroups,
  sellingWindows,
  assortmentTenures,
  colorOptions,
  seasonColorIds,
  proposedColorIds,
}: AddSlotDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [selectedColors, setSelectedColors] = useState<string[]>([])

  const defaultGenderId = audienceGenders.find((g) => g.code === 'mens')?.id ?? ''
  const defaultAgeGroupId = audienceAgeGroups.find((a) => a.code === 'adult')?.id ?? ''

  function handleSubmit(formData: FormData) {
    setError(null)

    const productTypeId = formData.get('productTypeId') as string
    const collectionId = (formData.get('collectionId') as string) || undefined
    const audienceGenderId = formData.get('audienceGenderId') as string
    const audienceAgeGroupId = formData.get('audienceAgeGroupId') as string
    const sellingWindowId = (formData.get('sellingWindowId') as string) || undefined
    const assortmentTenureId = (formData.get('assortmentTenureId') as string) || undefined
    const replacementFlag = formData.get('replacementFlag') === 'on'
    const notes = (formData.get('notes') as string)?.trim() || undefined

    if (!productTypeId) { setError('Product type is required.'); return }
    if (!audienceGenderId) { setError('Gender is required.'); return }
    if (!audienceAgeGroupId) { setError('Age group is required.'); return }

    startTransition(async () => {
      const result = await createSeasonSlot(seasonId, {
        productTypeId,
        collectionId,
        audienceGenderId,
        audienceAgeGroupId,
        sellingWindowId,
        assortmentTenureId,
        colorwayIds: selectedColors.length > 0 ? selectedColors : undefined,
        replacementFlag,
        notes,
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
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setSelectedColors([]) }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4" />
          Add Slot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Season Slot</DialogTitle>
          <DialogDescription>
            Plan a new SKU position in {seasonName}.
          </DialogDescription>
        </DialogHeader>

        <form id="add-slot-form" action={handleSubmit} className="flex-1 overflow-y-auto space-y-5 py-2 pl-1 pr-3 -mx-1 min-h-0">
          {/* ─── 1. Style Definition ─────────────────────────────── */}
          <div>
            <SectionLabel>Style Definition</SectionLabel>
            <div className="space-y-3">
              {/* Product Type */}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="slot-product-type">Garment Type</FieldLabel>
                <Select name="productTypeId" required>
                  <SelectTrigger
                    id="slot-product-type"
                    className="h-8 text-[12px]"
                  >
                    <SelectValue placeholder="Select garment type" />
                  </SelectTrigger>
                  <SelectContent
                    className="max-h-72"
                    style={{ fontFamily: 'var(--depot-font)' }}
                  >
                    {productHierarchy.flatMap((cat, catIdx) =>
                      cat.subcategories.map((sub, subIdx) => {
                        const isPassThrough =
                          cat.subcategories.length === 1 &&
                          sub.name.toLowerCase() === cat.name.toLowerCase()

                        return (
                          <SelectGroup key={sub.id}>
                            {(catIdx > 0 || subIdx > 0) && (
                              <SelectSeparator className="mx-2 my-1 bg-[var(--depot-border)]" />
                            )}
                            <SelectLabel className="flex flex-col gap-0 px-3 pt-2 pb-1">
                              {isPassThrough ? (
                                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--depot-ink)] leading-snug">
                                  {cat.name}
                                </span>
                              ) : (
                                <>
                                  <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-[var(--depot-faint)] leading-tight">
                                    {cat.name}
                                  </span>
                                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--depot-ink)] leading-snug">
                                    {sub.name}
                                  </span>
                                </>
                              )}
                            </SelectLabel>
                            {sub.productTypes.map((pt) => (
                              <SelectItem
                                key={pt.id}
                                value={pt.id}
                                className="pl-4 text-[12px] text-[var(--depot-ink-light)]"
                              >
                                {pt.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )
                      }),
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Construction + Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="slot-construction" optional>Construction</FieldLabel>
                  <DimensionSelect
                    id="slot-construction"
                    name="constructionId"
                    placeholder="—"
                    options={constructions}
                  />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="slot-weight" optional>Weight</FieldLabel>
                  <DimensionSelect
                    id="slot-weight"
                    name="weightClassId"
                    placeholder="—"
                    options={weightClasses}
                  />
                </div>
              </div>

              {/* Age + Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="slot-age-group">Age</FieldLabel>
                  <DimensionSelect
                    id="slot-age-group"
                    name="audienceAgeGroupId"
                    placeholder="Select"
                    options={audienceAgeGroups}
                    defaultValue={defaultAgeGroupId}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="slot-gender">Gender</FieldLabel>
                  <DimensionSelect
                    id="slot-gender"
                    name="audienceGenderId"
                    placeholder="Select"
                    options={audienceGenders}
                    defaultValue={defaultGenderId}
                    required
                  />
                </div>
              </div>

              {/* Fit Block */}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="slot-fit-block" optional>Fit Block</FieldLabel>
                <DimensionSelect
                  id="slot-fit-block"
                  name="fitBlockId"
                  placeholder="—"
                  options={fitBlocks}
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--depot-hairline)]" />

          {/* ─── 2. Variant Architecture ─────────────────────────── */}
          <div>
            <SectionLabel>Variant Architecture</SectionLabel>
            <div className="space-y-3">
              {/* Size Scale */}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="slot-size-scale" optional>Size Scale</FieldLabel>
                <DimensionSelect
                  id="slot-size-scale"
                  name="sizeScaleId"
                  placeholder="—"
                  options={sizeScales}
                />
              </div>

              {/* Colors */}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="slot-colors" optional>Colorways</FieldLabel>
                <SlotColorPicker
                  colorOptions={colorOptions}
                  seasonColorIds={seasonColorIds}
                  proposedColorIds={proposedColorIds}
                  value={selectedColors}
                  onChange={setSelectedColors}
                />
              </div>

              {/* Collection */}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="slot-collection" optional>Collection</FieldLabel>
                <DimensionSelect
                  id="slot-collection"
                  name="collectionId"
                  placeholder="Assign later"
                  options={collections}
                />
                <p className="text-[10px] text-[var(--depot-faint)]">
                  Required before a concept can fill this slot.
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--depot-hairline)]" />

          {/* ─── 3. Merchandising Strategy ───────────────────────── */}
          <div>
            <SectionLabel>Merchandising Strategy</SectionLabel>
            <div className="space-y-3">
              {/* Use Case */}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="slot-use-case" optional>Use Case</FieldLabel>
                <DimensionSelect
                  id="slot-use-case"
                  name="useCaseId"
                  placeholder="—"
                  options={useCases}
                />
              </div>

              {/* Selling Window + Tenure */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="slot-selling-window" optional>Selling Window</FieldLabel>
                  <DimensionSelect
                    id="slot-selling-window"
                    name="sellingWindowId"
                    placeholder="—"
                    options={sellingWindows}
                  />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="slot-tenure" optional>Tenure</FieldLabel>
                  <DimensionSelect
                    id="slot-tenure"
                    name="assortmentTenureId"
                    placeholder="—"
                    options={assortmentTenures}
                  />
                </div>
              </div>

              {/* Replacement flag */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="slot-replacement"
                  name="replacementFlag"
                  className="h-3.5 w-3.5 rounded border-gray-300"
                />
                <label htmlFor="slot-replacement" className="text-[11px] text-[var(--depot-ink-light)]">
                  Replacement SKU
                </label>
                <span className="text-[9px] text-[var(--depot-faint)] ml-0.5">
                  — replaces an existing SKU
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--depot-hairline)]" />

          {/* ─── 4. Notes ────────────────────────────────────────── */}
          <div>
            <SectionLabel>Notes</SectionLabel>
            <textarea
              id="slot-notes"
              name="notes"
              rows={3}
              placeholder="Planning context, design direction, or any other notes..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-[12px] text-[var(--depot-ink-light)] placeholder:text-[var(--depot-faint)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              style={{ fontFamily: 'var(--depot-font)' }}
            />
          </div>

          {error && (
            <p className="text-[12px] text-destructive bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}
        </form>

        <DialogFooter className="pt-3 border-t border-[var(--depot-hairline)]">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button form="add-slot-form" type="submit" disabled={isPending}>
            {isPending ? 'Adding...' : 'Add Slot'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
