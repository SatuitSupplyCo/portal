"use client"

import { useState } from "react"
import { ExternalLink, FileText } from "lucide-react"
import { InlineSvg } from "@/components/product/InlineSvg"
import type {
  Garment,
  Collection,
} from "@/lib/content/product-data"
import { roleDisplayMap } from "@/lib/content/product-data"

// ─── Types ───────────────────────────────────────────────────────────

type FlatView = "front" | "back"
type Tab = "blueprint" | "production" | "assets" | "log"

const TABS: { id: Tab; label: string }[] = [
  { id: "blueprint", label: "Blueprint" },
  { id: "production", label: "Production" },
  { id: "assets", label: "Assets" },
  { id: "log", label: "Log" },
]

// ─── Component ───────────────────────────────────────────────────────

interface GarmentDetailPanelProps {
  garment: Garment
  collection: Collection
}

export function GarmentDetailPanel({
  garment,
  collection,
}: GarmentDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("blueprint")

  const roleLabel = roleDisplayMap[garment.role] ?? garment.role

  return (
    <div className="flex flex-col" style={{ fontFamily: "var(--depot-font)" }}>
      {/* ─── Header ──────────────────────────────────────────── */}
      <div className="pb-4 border-b-2 border-[var(--depot-ink)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="depot-heading text-sm">
              {garment.name}
            </h3>
            <p className="mt-1.5 text-[10px] font-light text-[var(--depot-muted)] tracking-[0.08em]">
              {garment.sku} · {roleLabel} · {garment.tactile.weight}
            </p>
          </div>
          {garment.price && (
            <span className="text-sm font-medium text-[var(--depot-ink)] tabular-nums shrink-0 tracking-wide">
              {garment.price}
            </span>
          )}
        </div>
        <div className="mt-2">
          <span
            className="manifest-status"
            data-status={garment.status}
          >
            {garment.status}
          </span>
        </div>
      </div>

      {/* ─── Tab bar ─────────────────────────────────────────── */}
      <div className="product-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className="product-tab"
            data-active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Tab content ─────────────────────────────────────── */}
      <div className="pt-1">
        {activeTab === "blueprint" && (
          <BlueprintTab garment={garment} />
        )}
        {activeTab === "production" && (
          <ProductionTab garment={garment} collection={collection} />
        )}
        {activeTab === "assets" && <AssetsTab garment={garment} />}
        {activeTab === "log" && <LogTab garment={garment} />}
      </div>
    </div>
  )
}

// ─── Tab 1: Blueprint ────────────────────────────────────────────────

function BlueprintTab({ garment }: { garment: Garment }) {
  const [flatView, setFlatView] = useState<FlatView>("front")

  return (
    <>
      {/* The Flat — CAD wireframe view */}
      <div className="panel-section">
        <div className="flex items-center justify-between mb-3">
          <p className="panel-section-title mb-0">Technical Flat</p>
          {garment.techFlats && (
            <div className="flex gap-0 border border-[var(--depot-border)] overflow-hidden">
              <button
                type="button"
                className={`px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] transition-colors ${
                  flatView === "front"
                    ? "bg-[var(--depot-ink)] text-white"
                    : "bg-[var(--depot-surface)] text-[var(--depot-faint)] hover:text-[var(--depot-ink)]"
                }`}
                onClick={() => setFlatView("front")}
              >
                Front
              </button>
              <button
                type="button"
                className={`px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] transition-colors ${
                  flatView === "back"
                    ? "bg-[var(--depot-ink)] text-white"
                    : "bg-[var(--depot-surface)] text-[var(--depot-faint)] hover:text-[var(--depot-ink)]"
                }`}
                onClick={() => setFlatView("back")}
              >
                Back
              </button>
            </div>
          )}
        </div>
        {garment.techFlats ? (
          <div className="flat-detail crosshair-container w-full aspect-square bg-white border border-[var(--depot-hairline)] overflow-hidden flex items-center justify-center">
            <InlineSvg
              src={flatView === "front" ? garment.techFlats.front : garment.techFlats.back}
              alt={`${garment.name} — ${flatView} view`}
              className="w-full h-full p-4"
              hideLayers={["GRID"]}
            />
          </div>
        ) : (
          <div className="w-full aspect-[4/3] bg-[var(--depot-surface-alt)] border border-[var(--depot-hairline)] flex items-center justify-center">
            <span className="depot-label">
              No Flat Available
            </span>
          </div>
        )}

        {/* Annotations — dimension-line callout style */}
        {garment.annotations.length > 0 && (
          <div className="mt-5 space-y-3">
            {garment.annotations.map((a) => (
              <div key={a.id} className="annotation-row">
                <span className="text-[10px] font-semibold text-[var(--depot-ink)] shrink-0 w-24 uppercase tracking-[0.08em]">
                  {a.label}
                </span>
                <span className="text-[10px] font-light text-[var(--depot-muted)] leading-relaxed tracking-wide">
                  {a.note}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Colorways — squared swatches */}
      {garment.colorways && garment.colorways.length > 0 && (
        <div className="panel-section">
          <p className="panel-section-title">Colorways</p>
          <div className="space-y-3">
            {garment.colorways.map((c) => (
              <div key={c.hex} className="flex items-start gap-3">
                <span
                  className="color-swatch-lg mt-0.5"
                  style={{ backgroundColor: c.hex }}
                />
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-semibold text-[var(--depot-ink)] uppercase tracking-[0.06em]">
                      {c.name}
                    </span>
                    <span className="text-[9px] font-light text-[var(--depot-faint)] tracking-wider font-mono">
                      {c.hex}
                    </span>
                  </div>
                  {c.pantone && (
                    <p className="text-[9px] font-light text-[var(--depot-faint)] mt-0.5 tracking-wider">
                      Pantone {c.pantone}
                    </p>
                  )}
                  {c.note && (
                    <p className="text-[10px] font-light text-[var(--depot-muted)] mt-1 leading-relaxed tracking-wide">
                      {c.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOS Test */}
      {garment.bosTest && (
        <div className="panel-section">
          <p className="panel-section-title">The BOS Test</p>
          <p className="text-[11px] font-light text-[var(--depot-muted)] leading-relaxed tracking-wide">
            &ldquo;{garment.bosTest.question}&rdquo;
          </p>
          <p className="text-[11px] text-[var(--depot-ink-light)] mt-2 leading-relaxed tracking-wide">
            <span className="font-semibold text-[var(--depot-ink)]">The Answer: </span>
            <span className="font-light">{garment.bosTest.answer}</span>
          </p>
        </div>
      )}

      {/* Locked Decisions */}
      {garment.lockedDecisions.length > 0 && (
        <div className="panel-section">
          <p className="panel-section-title">Locked Decisions</p>
          <ul className="space-y-3">
            {garment.lockedDecisions.map((d, i) => (
              <li key={i}>
                <p className="text-[11px] font-medium text-[var(--depot-ink)] tracking-[0.04em]">
                  {d.decision}
                </p>
                <p className="text-[10px] font-light text-[var(--depot-faint)] mt-0.5 leading-relaxed tracking-wide">
                  {d.rationale}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tactile Signature */}
      <div className="panel-section">
        <p className="panel-section-title">Tactile Signature</p>
        <div className="space-y-2">
          {[
            ["Fabric", garment.tactile.fabricName],
            ["Composition", garment.tactile.composition],
            ["Weight", garment.tactile.weight],
            ["Finish", garment.tactile.finish],
          ].map(([label, value]) => (
            <div key={label} className="annotation-row">
              <span className="text-[10px] font-semibold text-[var(--depot-ink)] shrink-0 w-20 uppercase tracking-[0.08em]">
                {label}
              </span>
              <span className="text-[10px] font-light text-[var(--depot-muted)] tracking-wide">{value}</span>
            </div>
          ))}
          <p className="text-[10px] font-light text-[var(--depot-faint)] mt-3 leading-relaxed tracking-wide">
            {garment.tactile.behavior}
          </p>
        </div>
      </div>
    </>
  )
}

// ─── Tab 2: Production ───────────────────────────────────────────────

function ProductionTab({
  garment,
  collection,
}: {
  garment: Garment
  collection: Collection
}) {
  return (
    <>
      {/* The Vault */}
      <div className="panel-section">
        <p className="panel-section-title">The Vault</p>
        {garment.executionLinks.length > 0 ? (
          <ul className="space-y-2">
            {garment.executionLinks.map((link, i) => (
              <li key={i}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[11px] font-light text-[var(--depot-muted)] hover:text-[var(--depot-ink)] transition-colors group tracking-wide"
                >
                  <FileText className="w-3.5 h-3.5 text-[var(--depot-faint)] group-hover:text-[var(--depot-muted)]" />
                  <span>{link.label}</span>
                  <ExternalLink className="w-3 h-3 text-[var(--depot-faint)] ml-auto" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="panel-empty">No tech pack links yet.</p>
        )}
      </div>

      {/* Sourcing Card */}
      <div className="panel-section">
        <p className="panel-section-title">Sourcing</p>
        {garment.sourcing ? (
          <div className="space-y-2">
            {garment.sourcing.mill && (
              <div className="annotation-row">
                <span className="text-[10px] font-semibold text-[var(--depot-ink)] shrink-0 w-20 uppercase tracking-[0.08em]">Mill</span>
                <span className="text-[10px] font-light text-[var(--depot-muted)] tracking-wide">{garment.sourcing.mill}</span>
              </div>
            )}
            {garment.sourcing.fabricOrigin && (
              <div className="annotation-row">
                <span className="text-[10px] font-semibold text-[var(--depot-ink)] shrink-0 w-20 uppercase tracking-[0.08em]">Origin</span>
                <span className="text-[10px] font-light text-[var(--depot-muted)] tracking-wide">{garment.sourcing.fabricOrigin}</span>
              </div>
            )}
            {garment.sourcing.certifications && garment.sourcing.certifications.length > 0 && (
              <div className="annotation-row">
                <span className="text-[10px] font-semibold text-[var(--depot-ink)] shrink-0 w-20 uppercase tracking-[0.08em]">Certs</span>
                <span className="text-[10px] font-light text-[var(--depot-muted)] tracking-wide">
                  {garment.sourcing.certifications.join(", ")}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="panel-empty">No sourcing data yet.</p>
        )}
      </div>

      {/* Trim Sheet */}
      <div className="panel-section">
        <p className="panel-section-title">Trim Standard</p>
        {collection.trimStandards && collection.trimStandards.length > 0 ? (
          <div className="space-y-2">
            {collection.trimStandards.map((trim, i) => (
              <div key={i} className="annotation-row">
                <span className="text-[10px] font-semibold text-[var(--depot-ink)] shrink-0 w-20 uppercase tracking-[0.08em]">
                  {trim.label}
                </span>
                <span className="text-[10px] font-light text-[var(--depot-muted)] tracking-wide">{trim.spec}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="panel-empty">No trim standards defined.</p>
        )}
      </div>
    </>
  )
}

// ─── Tab 3: Assets ───────────────────────────────────────────────────

function AssetsTab({ garment }: { garment: Garment }) {
  return (
    <>
      {/* Image Bank */}
      <div className="panel-section">
        <p className="panel-section-title">Image Bank</p>
        {garment.imageBank && garment.imageBank.length > 0 ? (
          <ul className="space-y-2">
            {garment.imageBank.map((link, i) => (
              <li key={i}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[11px] font-light text-[var(--depot-muted)] hover:text-[var(--depot-ink)] transition-colors tracking-wide"
                >
                  <FileText className="w-3.5 h-3.5 text-[var(--depot-faint)]" />
                  <span>{link.label}</span>
                  <ExternalLink className="w-3 h-3 text-[var(--depot-faint)] ml-auto" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="panel-empty">No image assets linked yet.</p>
        )}
      </div>

      {/* Copy Blocks */}
      <div className="panel-section">
        <p className="panel-section-title">Copy Blocks</p>
        {garment.copyBlocks ? (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-semibold text-[var(--depot-ink)] mb-1 uppercase tracking-[0.08em]">
                Short
              </p>
              <p className="text-[11px] font-light text-[var(--depot-muted)] leading-relaxed tracking-wide">
                {garment.copyBlocks.short}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[var(--depot-ink)] mb-1 uppercase tracking-[0.08em]">
                Long
              </p>
              <p className="text-[11px] font-light text-[var(--depot-muted)] leading-relaxed tracking-wide">
                {garment.copyBlocks.long}
              </p>
            </div>
          </div>
        ) : (
          <p className="panel-empty">No approved copy yet.</p>
        )}
      </div>

      {/* Context Guide */}
      <div className="panel-section">
        <p className="panel-section-title">Context Guide</p>
        {garment.contextGuide ? (
          <p className="text-[11px] font-light text-[var(--depot-muted)] leading-relaxed tracking-wide">
            {garment.contextGuide}
          </p>
        ) : (
          <p className="panel-empty">No photography direction yet.</p>
        )}
      </div>
    </>
  )
}

// ─── Tab 4: Log ──────────────────────────────────────────────────────

function LogTab({ garment }: { garment: Garment }) {
  return (
    <>
      {/* Version History */}
      <div className="panel-section">
        <p className="panel-section-title">Version History</p>
        {garment.lineage.length > 0 ? (
          <div className="space-y-4">
            {garment.lineage.map((entry, i) => (
              <div key={i}>
                <div className="flex items-baseline gap-3">
                  <span className="text-[11px] font-semibold text-[var(--depot-ink)] uppercase tracking-[0.06em]">
                    {entry.version}
                  </span>
                  <span className="text-[9px] font-light text-[var(--depot-faint)] tracking-wider">
                    {entry.date}
                  </span>
                </div>
                <ul className="mt-1.5 space-y-1">
                  {entry.changes.map((change, j) => (
                    <li
                      key={j}
                      className="annotation-row text-[10px] font-light text-[var(--depot-muted)] leading-relaxed tracking-wide"
                    >
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="panel-empty">No version history.</p>
        )}
      </div>

      {/* Inventory Snapshot */}
      <div className="panel-section">
        <p className="panel-section-title">Inventory</p>
        {garment.inventoryStatus ? (
          <p className="text-[11px] font-light text-[var(--depot-muted)] tracking-wide">{garment.inventoryStatus}</p>
        ) : (
          <p className="panel-empty">No inventory data yet.</p>
        )}
      </div>

      {/* Performance Notes */}
      <div className="panel-section">
        <p className="panel-section-title">Performance Notes</p>
        {garment.performanceNotes && garment.performanceNotes.length > 0 ? (
          <ul className="space-y-1.5">
            {garment.performanceNotes.map((note, i) => (
              <li key={i} className="annotation-row text-[11px] font-light text-[var(--depot-muted)] leading-relaxed tracking-wide">
                {note}
              </li>
            ))}
          </ul>
        ) : (
          <p className="panel-empty">No performance notes yet.</p>
        )}
      </div>
    </>
  )
}
