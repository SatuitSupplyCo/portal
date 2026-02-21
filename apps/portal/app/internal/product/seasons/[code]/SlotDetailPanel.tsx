'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { Button } from '@repo/ui/button'
import type { SlotGridEntry } from './FilteredSlotGrid'
import type { ColorOption } from './SlotColorPicker'
import type { TaxonomyCategory, TaxonomyDimension } from './AddSlotDialog'
import { EditSlotDialog } from './EditSlotDialog'

const slotStatusColors: Record<string, string> = {
  open: 'bg-amber-100 text-amber-800',
  filled: 'bg-emerald-100 text-emerald-800',
  removed: 'bg-zinc-100 text-zinc-400',
}

const conceptStatusColors: Record<string, string> = {
  draft: 'bg-zinc-100 text-zinc-600',
  spec: 'bg-blue-100 text-blue-700',
  sampling: 'bg-purple-100 text-purple-700',
  costing: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  production: 'bg-indigo-100 text-indigo-700',
  live: 'bg-green-100 text-green-800',
  retired: 'bg-zinc-100 text-zinc-400',
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-[10px] font-semibold text-[var(--depot-ink)] shrink-0 w-24 uppercase tracking-[0.08em]">
        {label}
      </span>
      <span className="text-[10px] font-light text-[var(--depot-muted)] tracking-wide">
        {children}
      </span>
    </div>
  )
}

interface SlotDetailPanelProps {
  slot: SlotGridEntry
  colorOptions: ColorOption[]
  editProps?: {
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
    seasonColorIds: string[]
    proposedColorIds: string[]
    dimensionIdLookup: {
      genders: Record<string, string>
      ageGroups: Record<string, string>
      sellingWindows: Record<string, string>
      assortmentTenures: Record<string, string>
      collections: Record<string, string>
    }
  }
}

export function SlotDetailPanel({ slot, colorOptions, editProps }: SlotDetailPanelProps) {
  const [editOpen, setEditOpen] = useState(false)

  const concept = slot.skuConcept
  const snapshot = concept?.metadataSnapshot

  const slotColors = colorOptions.filter((c) => slot.colorwayIds.includes(c.id))
  const canEdit = !!editProps && slot.status === 'open'

  return (
    <div className="flex flex-col" style={{ fontFamily: 'var(--depot-font)' }}>
      {/* ─── Header ──────────────────────────────────────────── */}
      <div className="pb-4 border-b-2 border-[var(--depot-ink)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="depot-heading text-sm">
              {slot.productType.name}
            </h3>
            <p className="mt-1.5 text-[10px] font-light text-[var(--depot-muted)] tracking-[0.08em]">
              {slot.productType.subcategory.category.name} / {slot.productType.subcategory.name}
            </p>
          </div>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-[11px] shrink-0"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded-sm font-medium uppercase tracking-wider ${slotStatusColors[slot.status] ?? ''}`}
          >
            {slot.status}
          </span>
          {concept && (
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-sm font-medium uppercase tracking-wider ${conceptStatusColors[concept.status] ?? ''}`}
            >
              {concept.status}
            </span>
          )}
          {slot.replacementFlag && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-sm font-medium uppercase tracking-wider bg-amber-50 text-amber-600">
              Replacement
            </span>
          )}
        </div>
      </div>

      {/* ─── Style Definition ────────────────────────────────── */}
      <div className="panel-section">
        <p className="panel-section-title">Style Definition</p>
        <div className="space-y-2">
          <DetailRow label="Category">{slot.productType.subcategory.category.name}</DetailRow>
          <DetailRow label="Subcategory">{slot.productType.subcategory.name}</DetailRow>
          <DetailRow label="Product Type">{slot.productType.name}</DetailRow>
          {slot.audienceGender && (
            <DetailRow label="Gender">{slot.audienceGender.label}</DetailRow>
          )}
          {slot.audienceAgeGroup && (
            <DetailRow label="Age Group">{slot.audienceAgeGroup.label}</DetailRow>
          )}
        </div>
      </div>

      {/* ─── Collection & Colors ─────────────────────────────── */}
      <div className="panel-section">
        <p className="panel-section-title">Variant Architecture</p>
        <div className="space-y-3">
          <DetailRow label="Collection">
            {slot.collection ? slot.collection.name : (
              <span className="text-[var(--depot-faint)] italic">Unassigned</span>
            )}
          </DetailRow>

          {slotColors.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-[var(--depot-ink)] mb-2 uppercase tracking-[0.08em]">
                Colorways
              </p>
              <div className="space-y-2">
                {slotColors.map((color) => (
                  <div key={color.id} className="flex items-center gap-2.5">
                    <span
                      className="w-5 h-5 rounded-sm border border-[var(--depot-hairline)] shrink-0"
                      style={{ backgroundColor: color.hex ?? '#e5e7eb' }}
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-medium text-[var(--depot-ink)] tracking-wide">
                        {color.title}
                      </span>
                      {color.pantone && (
                        <span className="text-[9px] font-light text-[var(--depot-faint)] ml-1.5 tracking-wider">
                          {color.pantone}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Merchandising Strategy ──────────────────────────── */}
      <div className="panel-section">
        <p className="panel-section-title">Merchandising Strategy</p>
        <div className="space-y-2">
          <DetailRow label="Selling Window">
            {slot.sellingWindow?.label ?? <span className="text-[var(--depot-faint)]">—</span>}
          </DetailRow>
          <DetailRow label="Tenure">
            {slot.assortmentTenure?.label ?? <span className="text-[var(--depot-faint)]">—</span>}
          </DetailRow>
        </div>
      </div>

      {/* ─── Concept (filled slots) ──────────────────────────── */}
      {concept && (
        <div className="panel-section">
          <p className="panel-section-title">SKU Concept</p>
          <div className="space-y-2">
            <DetailRow label="Title">
              <Link
                href={`/internal/product/concepts/${concept.id}`}
                className="text-[var(--depot-ink)] underline-offset-2 hover:underline"
              >
                {(snapshot?.title as string) ?? 'Untitled Concept'}
              </Link>
            </DetailRow>
            {concept.construction && (
              <DetailRow label="Construction">{concept.construction.label}</DetailRow>
            )}
            {concept.materialWeightClass && (
              <DetailRow label="Weight">{concept.materialWeightClass.label}</DetailRow>
            )}
            {concept.useCase && (
              <DetailRow label="Use Case">{concept.useCase.label}</DetailRow>
            )}
            {typeof snapshot?.description === 'string' && snapshot.description && (
              <div className="mt-3">
                <p className="text-[10px] font-light text-[var(--depot-muted)] leading-relaxed tracking-wide">
                  {snapshot.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Edit Dialog ─────────────────────────────────────── */}
      {editProps && (
        <EditSlotDialog
          slot={slot}
          seasonName={editProps.seasonName}
          productHierarchy={editProps.productHierarchy}
          collections={editProps.collections}
          constructions={editProps.constructions}
          weightClasses={editProps.weightClasses}
          fitBlocks={editProps.fitBlocks}
          sizeScales={editProps.sizeScales}
          useCases={editProps.useCases}
          audienceGenders={editProps.audienceGenders}
          audienceAgeGroups={editProps.audienceAgeGroups}
          sellingWindows={editProps.sellingWindows}
          assortmentTenures={editProps.assortmentTenures}
          colorOptions={colorOptions}
          seasonColorIds={editProps.seasonColorIds}
          proposedColorIds={editProps.proposedColorIds}
          dimensionIdLookup={editProps.dimensionIdLookup}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </div>
  )
}
