import type { Metadata } from "next"
import Link from "next/link"
import { DocPageShell } from "@/components/nav/DocPageShell"
import { systemPillars, collections } from "@/lib/content/product-data"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Product System | Satuit Supply Co.",
}

// ─── Page ────────────────────────────────────────────────────────────

export default function ProductIndexPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: "Product" }]}>
      <main className="flex-1 overflow-y-auto" style={{ fontFamily: "var(--depot-font)" }}>
        {/* ─── Header ──────────────────────────────────────────── */}
        <div className="depot-header">
          {/* Two Flags anchor mark */}
          <div className="flex items-center gap-3 mb-6">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" className="shrink-0">
              <rect x="0" y="0" width="8" height="14" fill="#0f1a2e" />
              <rect x="10" y="0" width="8" height="14" fill="#0f1a2e" />
            </svg>
            <span className="depot-label" style={{ marginBottom: 0 }}>
              Satuit Supply Co.
            </span>
          </div>

          <h1 className="depot-heading text-xl">
            Satuit V1 Launch
          </h1>
          <p className="mt-3 text-xs font-light text-[var(--depot-muted)] max-w-lg leading-relaxed tracking-wide">
            4 collections · 15 SKUs · One standard. BOS-aligned, system-driven.
          </p>

          {/* Metadata — Dimension-line style */}
          <div className="flex gap-12 mt-6 pt-6 border-t border-[var(--depot-hairline)]">
            <div>
              <p className="depot-label mb-1">Strategy</p>
              <p className="text-xs font-light text-[var(--depot-ink-light)] tracking-wide">
                BOS-Aligned / System-Driven
              </p>
            </div>
            <div>
              <p className="depot-label mb-1">Global Trim Rule</p>
              <p className="text-xs font-light text-[var(--depot-ink-light)] tracking-wide">
                Universal Neck Tape (Locked)
              </p>
            </div>
            <div>
              <p className="depot-label mb-1">External Branding</p>
              <p className="text-xs font-light text-[var(--depot-ink-light)] tracking-wide">
                1 Placement Max / SKU
              </p>
            </div>
          </div>
        </div>

        {/* ─── System Pillars ──────────────────────────────────── */}
        <section className="px-12 py-10 border-b border-[var(--depot-border)]">
          <p className="depot-label mb-6">System Pillars</p>
          <div className="grid md:grid-cols-3 gap-4">
            {systemPillars.map((pillar) => (
              <div key={pillar.id} className="pillar-block">
                <p className="depot-subheading text-xs mb-2">
                  {pillar.title}
                </p>
                <p className="text-[11px] font-light text-[var(--depot-ink-light)] leading-relaxed tracking-wide">
                  {pillar.test}
                </p>
                <div className="mt-4 pt-3 border-t border-[var(--depot-hairline)]">
                  <p className="depot-label" style={{ marginBottom: 0 }}>
                    Focus: {pillar.focus}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Collection Manifest ─────────────────────────────── */}
        <section className="px-12 py-10">
          <p className="depot-label mb-6">Collections</p>

          {/* Manifest column headers */}
          <div className="manifest-header">
            <span>#</span>
            <span>Collection</span>
            <span>SKUs</span>
            <span className="text-right">Status</span>
          </div>

          {/* Manifest rows — data first */}
          {collections.map((collection, i) => (
            <Link
              key={collection.slug}
              href={`/internal/product/${collection.slug}`}
              className="block"
            >
              <div className="manifest-row group" style={{ gridTemplateColumns: "auto 1fr auto auto" }}>
                {/* Index number */}
                <span className="text-[11px] font-light text-[var(--depot-faint)] tabular-nums tracking-wider w-6">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Name + role */}
                <div className="min-w-0">
                  <p className="manifest-name group-hover:text-[var(--depot-ink-light)] transition-colors">
                    {collection.name}
                  </p>
                  {collection.designMandate && (
                    <p className="text-[10px] font-light text-[var(--depot-faint)] tracking-wider mt-0.5 uppercase">
                      {collection.designMandate}
                    </p>
                  )}
                </div>

                {/* SKU count */}
                <span className="manifest-sku">
                  {collection.garments.length} SKUs
                </span>

                {/* Status */}
                <span
                  className="manifest-status"
                  data-status={collection.status}
                >
                  {collection.status}
                </span>
              </div>
            </Link>
          ))}
        </section>
      </main>
    </DocPageShell>
  )
}
