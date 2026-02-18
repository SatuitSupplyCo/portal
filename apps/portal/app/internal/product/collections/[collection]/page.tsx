"use client"

import { useState, useCallback } from "react"
import { notFound } from "next/navigation"
import { use } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { DocPageShell } from "@/components/nav/DocPageShell"
import { GarmentDetailPanel } from "@/components/product/GarmentDetailPanel"
import { InlineSvg } from "@/components/product/InlineSvg"
import { useShell } from "@/components/shell/ShellProvider"
import {
  getCollection,
  getCollectionByTaxonomyCode,
  roleDisplayMap,
} from "@/lib/content/product-data"
import type { Garment } from "@/lib/content/product-data"

// ─── Page ────────────────────────────────────────────────────────────

export default function CollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>
}) {
  const { collection: code } = use(params)

  // Look up by taxonomy code first, then fall back to legacy slug
  const collection = getCollectionByTaxonomyCode(code) ?? getCollection(code)
  if (!collection) notFound()

  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(null)
  const { setRightRailContent, setRightRailOpen } = useShell()

  const openGarment = useCallback(
    (garment: Garment) => {
      setSelectedGarment(garment)
      setRightRailContent(
        <GarmentDetailPanel
          key={garment.slug}
          garment={garment}
          collection={collection}
        />,
      )
      setRightRailOpen(true)
    },
    [collection, setRightRailContent, setRightRailOpen],
  )

  // Detect when the RightRail is closed externally (via its X button)
  const rightRailOpen = useShell().rightRailOpen
  const isOpen = rightRailOpen && selectedGarment !== null

  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Product", href: "/internal/product" },
        { label: "Collections" },
        { label: collection.name },
      ]}
    >
      <main className="flex-1 overflow-y-auto" style={{ fontFamily: "var(--depot-font)" }}>
        {/* ─── Collection header ──────────────────────────────── */}
        <div className="depot-header">
          {/* Two Flags + breadcrumb context */}
          <div className="flex items-center gap-3 mb-5">
            <svg width="14" height="10" viewBox="0 0 18 14" fill="none" className="shrink-0">
              <rect x="0" y="0" width="8" height="14" fill="#0f1a2e" />
              <rect x="10" y="0" width="8" height="14" fill="#0f1a2e" />
            </svg>
            <span className="depot-label" style={{ marginBottom: 0 }}>
              Satuit Supply Co.
            </span>
          </div>

          {/* Title row */}
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="depot-heading text-lg">
                {collection.name}
              </h1>
              {collection.designMandate && (
                <p className="mt-1.5 text-[10px] font-light uppercase tracking-[0.18em] text-[var(--depot-faint)]">
                  {collection.designMandate}
                </p>
              )}
            </div>
            <div className="flex items-center gap-5 shrink-0">
              <span
                className="manifest-status"
                data-status={collection.status}
              >
                {collection.status}
              </span>
              <span className="manifest-sku">
                {collection.garments.length} SKUs
              </span>
            </div>
          </div>

          {/* Narrative */}
          <p className="mt-5 text-xs font-light text-[var(--depot-muted)] leading-relaxed max-w-2xl tracking-wide">
            {collection.intent}
          </p>

          {/* Metadata — dimension-line callouts */}
          <div className="flex flex-wrap gap-x-10 gap-y-4 mt-6 pt-6 border-t border-[var(--depot-hairline)]">
            {collection.brandingMandate && (
              <div>
                <p className="depot-label mb-1">Branding</p>
                <p className="text-[11px] font-light text-[var(--depot-ink-light)] tracking-wide">
                  {collection.brandingMandate}
                </p>
              </div>
            )}

            {collection.trimStandards &&
              collection.trimStandards.length > 0 && (
                <div>
                  <p className="depot-label mb-1">Trim Standard</p>
                  <div className="space-y-0.5">
                    {collection.trimStandards.map((trim, i) => (
                      <p key={i} className="text-[11px] font-light text-[var(--depot-ink-light)] tracking-wide">
                        <span className="font-medium">{trim.label}:</span>{" "}
                        {trim.spec}
                      </p>
                    ))}
                  </div>
                </div>
              )}

            <div>
              <p className="depot-label mb-1">BOS Test</p>
              <p className="text-[11px] font-light text-[var(--depot-muted)] max-w-sm tracking-wide">
                &ldquo;{collection.judgeOfSuccess}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* ─── Garment Manifest ───────────────────────────────── */}
        <div className="px-12 py-8">
          {/* Manifest header */}
          <div className="manifest-header" style={{ gridTemplateColumns: "56px 1fr auto auto auto" }}>
            <span>Flat</span>
            <span>Designation</span>
            <span>Role</span>
            <span>Weight</span>
            <span className="text-right">Price</span>
          </div>

          {/* Garment rows — data first, thumbnail secondary */}
          {collection.garments.map((garment) => (
            <button
              key={garment.slug}
              type="button"
              className="manifest-row w-full text-left"
              style={{ gridTemplateColumns: "56px 1fr auto auto auto" }}
              data-selected={
                selectedGarment?.slug === garment.slug && isOpen
              }
              onClick={() => openGarment(garment)}
            >
              {/* Flat thumbnail — small, precise */}
              <div className="flat-thumbnail">
                {garment.techFlats ? (
                  <InlineSvg
                    src={garment.techFlats.front}
                    alt={`${garment.name} flat`}
                    className="flat-thumbnail-svg"
                    hideLayers={["GRID", "ANNOTATION"]}
                  />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="flat-thumbnail-fallback">
                    <rect x="4" y="2" width="16" height="20" rx="1" />
                    <line x1="8" y1="6" x2="16" y2="6" />
                    <line x1="8" y1="10" x2="16" y2="10" />
                  </svg>
                )}
              </div>

              {/* Name + SKU + colorways — the data */}
              <div className="min-w-0">
                <p className="manifest-name truncate">
                  {garment.name}
                </p>
                <p className="manifest-sku mt-0.5">
                  {garment.sku}
                </p>
                {garment.colorways && garment.colorways.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    {garment.colorways.map((c) => (
                      <span
                        key={c.hex}
                        title={c.name}
                        className="color-swatch"
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Role */}
              <span className="text-[10px] font-light uppercase tracking-[0.14em] text-[var(--depot-faint)]">
                {roleDisplayMap[garment.role] ?? garment.role}
              </span>

              {/* Weight */}
              <span className="manifest-sku">
                {garment.tactile.weight}
              </span>

              {/* Price */}
              {garment.price ? (
                <span className="text-xs font-medium text-[var(--depot-ink)] tabular-nums shrink-0 text-right">
                  {garment.price}
                </span>
              ) : (
                <span className="text-[10px] font-light text-[var(--depot-faint)] text-right">
                  —
                </span>
              )}
            </button>
          ))}

          {/* ─── Bottom sections ──────────────────────────────── */}
          <div className="mt-12 space-y-10">
            {/* Anti-Spec */}
            {collection.antiSpec.length > 0 && (
              <div>
                <p className="depot-label mb-4">Anti-Spec</p>
                <ul className="space-y-2">
                  {collection.antiSpec.map((item, i) => (
                    <li
                      key={i}
                      className="annotation-row text-[11px] font-light text-[var(--depot-muted)] leading-relaxed tracking-wide"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Collection links */}
            {(collection.assets.length > 0 ||
              collection.operationalLinks.length > 0) && (
              <div>
                <p className="depot-label mb-4">Links</p>
                <ul className="space-y-2">
                  {[...collection.assets, ...collection.operationalLinks].map(
                    (link, i) => (
                      <li key={i}>
                        <Link
                          href={link.href}
                          target={
                            link.href.startsWith("http") ? "_blank" : undefined
                          }
                          className="flex items-center gap-2 text-[11px] font-light text-[var(--depot-muted)] hover:text-[var(--depot-ink)] transition-colors tracking-wide"
                        >
                          <span>{link.label}</span>
                          <ExternalLink className="w-3 h-3 text-[var(--depot-faint)]" />
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </DocPageShell>
  )
}
