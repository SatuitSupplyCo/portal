'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from '@repo/ui/button'
import { Label } from '@repo/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { updateSeasonSlot } from '../../actions'
import { SlotColorPicker, type ColorOption } from './SlotColorPicker'
import type { TaxonomyCategory, TaxonomyDimension } from './AddSlotDialog'
import type { SlotGridEntry } from './FilteredSlotGrid'

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
  value,
  onValueChange,
  placeholder,
  options,
  required,
}: {
  id: string
  value: string
  onValueChange: (v: string) => void
  placeholder: string
  options: TaxonomyDimension[]
  required?: boolean
}) {
  return (
    <Select value={value} onValueChange={onValueChange} required={required}>
      <SelectTrigger id={id} className="h-8 text-[12px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {!required && (
          <SelectItem value="__none__" className="text-[12px] text-[var(--depot-faint)]">
            — None —
          </SelectItem>
        )}
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id} className="text-[12px]">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// ─── Types ──────────────────────────────────────────────────────────

export interface EditSlotDialogProps {
  slot: SlotGridEntry
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
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Mapping from taxonomy dimension ID → lookup data needed to resolve initial IDs */
  dimensionIdLookup: {
    genders: Record<string, string>
    ageGroups: Record<string, string>
    sellingWindows: Record<string, string>
    assortmentTenures: Record<string, string>
    collections: Record<string, string>
  }
}

// ─── Component ──────────────────────────────────────────────────────

export function EditSlotDialog({
  slot,
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
  open,
  onOpenChange,
  dimensionIdLookup,
}: EditSlotDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Resolve initial IDs from slot codes
  const resolveId = (lookup: Record<string, string>, code: string | undefined) =>
    code ? lookup[code] ?? '' : ''

  const initialGenderId = resolveId(dimensionIdLookup.genders, slot.audienceGender?.code)
  const initialAgeGroupId = resolveId(dimensionIdLookup.ageGroups, slot.audienceAgeGroup?.code)
  const initialSellingWindowId = resolveId(dimensionIdLookup.sellingWindows, slot.sellingWindow?.code)
  const initialAssortmentTenureId = resolveId(dimensionIdLookup.assortmentTenures, slot.assortmentTenure?.code)
  const initialCollectionId = resolveId(dimensionIdLookup.collections, slot.collection?.code)

  // Find the product type ID from hierarchy
  const findProductTypeId = () => {
    for (const cat of productHierarchy) {
      for (const sub of cat.subcategories) {
        for (const pt of sub.productTypes) {
          if (pt.code === slot.productType.code) return pt.id
        }
      }
    }
    return ''
  }
  const initialProductTypeId = findProductTypeId()

  // Controlled state for all form fields
  const [productTypeId, setProductTypeId] = useState(initialProductTypeId)
  const [collectionId, setCollectionId] = useState(initialCollectionId || '__none__')
  const [genderId, setGenderId] = useState(initialGenderId)
  const [ageGroupId, setAgeGroupId] = useState(initialAgeGroupId)
  const [sellingWindowId, setSellingWindowId] = useState(initialSellingWindowId || '__none__')
  const [assortmentTenureId, setAssortmentTenureId] = useState(initialAssortmentTenureId || '__none__')
  const [replacementFlag, setReplacementFlag] = useState(slot.replacementFlag)
  const [selectedColors, setSelectedColors] = useState<string[]>(slot.colorwayIds)

  // Reset form state when the slot changes (different slot opened for editing)
  useEffect(() => {
    if (open) {
      setProductTypeId(findProductTypeId())
      setCollectionId(resolveId(dimensionIdLookup.collections, slot.collection?.code) || '__none__')
      setGenderId(resolveId(dimensionIdLookup.genders, slot.audienceGender?.code))
      setAgeGroupId(resolveId(dimensionIdLookup.ageGroups, slot.audienceAgeGroup?.code))
      setSellingWindowId(resolveId(dimensionIdLookup.sellingWindows, slot.sellingWindow?.code) || '__none__')
      setAssortmentTenureId(resolveId(dimensionIdLookup.assortmentTenures, slot.assortmentTenure?.code) || '__none__')
      setReplacementFlag(slot.replacementFlag)
      setSelectedColors(slot.colorwayIds)
      setError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, slot.id])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!productTypeId) { setError('Product type is required.'); return }
    if (!genderId) { setError('Gender is required.'); return }
    if (!ageGroupId) { setError('Age group is required.'); return }

    startTransition(async () => {
      const result = await updateSeasonSlot(slot.id, {
        productTypeId,
        collectionId: collectionId !== '__none__' ? collectionId : undefined,
        audienceGenderId: genderId,
        audienceAgeGroupId: ageGroupId,
        sellingWindowId: sellingWindowId !== '__none__' ? sellingWindowId : undefined,
        assortmentTenureId: assortmentTenureId !== '__none__' ? assortmentTenureId : undefined,
        colorwayIds: selectedColors.length > 0 ? selectedColors : undefined,
        replacementFlag,
      })

      if (!result.success) {
        setError(result.error)
      } else {
        onOpenChange(false)
        setError(null)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Season Slot</DialogTitle>
          <DialogDescription>
            Update the slot configuration in {seasonName}.
          </DialogDescription>
        </DialogHeader>

        <form id="edit-slot-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-5 py-2 pl-1 pr-3 -mx-1 min-h-0">
          {/* ─── 1. Style Definition ─────────────────────────────── */}
          <div>
            <SectionLabel>Style Definition</SectionLabel>
            <div className="space-y-3">
              {/* Product Type */}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="edit-slot-product-type">Garment Type</FieldLabel>
                <Select value={productTypeId} onValueChange={setProductTypeId} required>
                  <SelectTrigger id="edit-slot-product-type" className="h-8 text-[12px]">
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

              {/* Age + Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="edit-slot-age-group">Age</FieldLabel>
                  <DimensionSelect
                    id="edit-slot-age-group"
                    value={ageGroupId}
                    onValueChange={setAgeGroupId}
                    placeholder="Select"
                    options={audienceAgeGroups}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="edit-slot-gender">Gender</FieldLabel>
                  <DimensionSelect
                    id="edit-slot-gender"
                    value={genderId}
                    onValueChange={setGenderId}
                    placeholder="Select"
                    options={audienceGenders}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--depot-hairline)]" />

          {/* ─── 2. Variant Architecture ─────────────────────────── */}
          <div>
            <SectionLabel>Variant Architecture</SectionLabel>
            <div className="space-y-3">
              {/* Colors */}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="edit-slot-colors" optional>Colorways</FieldLabel>
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
                <FieldLabel htmlFor="edit-slot-collection" optional>Collection</FieldLabel>
                <DimensionSelect
                  id="edit-slot-collection"
                  value={collectionId}
                  onValueChange={setCollectionId}
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
              {/* Selling Window + Tenure */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="edit-slot-selling-window" optional>Selling Window</FieldLabel>
                  <DimensionSelect
                    id="edit-slot-selling-window"
                    value={sellingWindowId}
                    onValueChange={setSellingWindowId}
                    placeholder="—"
                    options={sellingWindows}
                  />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="edit-slot-tenure" optional>Tenure</FieldLabel>
                  <DimensionSelect
                    id="edit-slot-tenure"
                    value={assortmentTenureId}
                    onValueChange={setAssortmentTenureId}
                    placeholder="—"
                    options={assortmentTenures}
                  />
                </div>
              </div>

              {/* Replacement flag */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-slot-replacement"
                  checked={replacementFlag}
                  onChange={(e) => setReplacementFlag(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-gray-300"
                />
                <label htmlFor="edit-slot-replacement" className="text-[11px] text-[var(--depot-ink-light)]">
                  Replacement SKU
                </label>
                <span className="text-[9px] text-[var(--depot-faint)] ml-0.5">
                  — replaces an existing SKU
                </span>
              </div>
            </div>
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
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button form="edit-slot-form" type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
