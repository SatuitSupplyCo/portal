import { InfoTooltip, type GlossaryEntry } from "@/components/InfoTooltip"
import { SeasonHeaderSwatches } from "../SeasonHeaderSwatches"
import { SeasonPlanSection } from "../SeasonPlanSection"
import type { SeasonColorEntry } from "../SeasonColorPalette"

const seasonStatusColors: Record<string, string> = {
  planning: "bg-amber-100 text-amber-800",
  locked: "bg-blue-100 text-blue-800",
  active: "bg-emerald-100 text-emerald-800",
  closed: "bg-zinc-100 text-zinc-500",
}

interface SeasonHeaderProps {
  season: {
    name: string
    status: string
    seasonType: string
    code: string
    launchDate: Date | null
    description: string | null
    minorMaxSkus?: number | null
    id: string
    targetSkuCount: number | null
    marginTarget: unknown
    targetEvergreenPct: number | null
  }
  seasonColorData: SeasonColorEntry[]
  glossary: Record<string, GlossaryEntry>
  isPlanning: boolean
  activeSlotsCount: number
  filledSlotsCount: number
  openSlotsCount: number
  evergreenPct: number
  evergreenCount: number
}

export function SeasonHeader({
  season,
  seasonColorData,
  glossary,
  isPlanning,
  activeSlotsCount,
  filledSlotsCount,
  openSlotsCount,
  evergreenPct,
  evergreenCount,
}: SeasonHeaderProps) {
  return (
    <div className="depot-header">
      <div className="flex items-center gap-3 mb-3">
        <h1 className="depot-heading text-xl">{season.name}</h1>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-sm font-medium uppercase tracking-wider ${seasonStatusColors[season.status] ?? ""}`}
        >
          {season.status}
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-sm font-medium uppercase tracking-wider bg-zinc-100 text-zinc-600">
          {season.seasonType}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-12">
        <div>
          <div className="flex items-center gap-3 text-xs font-light text-[var(--depot-muted)] tracking-wide mb-4">
            <span>{season.code}</span>
            {season.launchDate && (
              <>
                <span className="text-[var(--depot-hairline)]">·</span>
                <span>
                  Launch{" "}
                  <time
                    dateTime={season.launchDate.toISOString()}
                    className="font-medium text-[var(--depot-ink-light)]"
                  >
                    {season.launchDate.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </span>
              </>
            )}
            {season.seasonType === "minor" && season.minorMaxSkus && (
              <>
                <span className="text-[var(--depot-hairline)]">·</span>
                <span className="inline-flex items-center gap-1">
                  Hard cap: {season.minorMaxSkus} SKUs
                  <InfoTooltip slug="hard-cap" glossary={glossary} />
                </span>
              </>
            )}
          </div>

          {season.description && (
            <p className="text-[13px] leading-relaxed text-[var(--depot-ink-light)] mb-5">{season.description}</p>
          )}

          {seasonColorData.length > 0 && (
            <SeasonHeaderSwatches
              colors={seasonColorData.map((color) => {
                const meta = color.studioEntry.categoryMetadata
                const hex =
                  meta && typeof meta.hex === "string" && /^#[0-9a-fA-F]{6}$/.test(meta.hex as string)
                    ? (meta.hex as string)
                    : null
                const pantone = meta && typeof meta.pantone === "string" ? (meta.pantone as string) : null
                return {
                  id: color.id,
                  studioEntryId: color.studioEntryId,
                  status: color.status,
                  title: color.studioEntry.title,
                  hex,
                  pantone,
                  tags: color.studioEntry.tags,
                }
              })}
            />
          )}
        </div>

        {isPlanning && (
          <div className="lg:border-l lg:border-[var(--depot-hairline)] lg:pl-10">
            <SeasonPlanSection
              seasonId={season.id}
              seasonName={season.name}
              totalSlots={activeSlotsCount}
              filledSlots={filledSlotsCount}
              openSlotCount={openSlotsCount}
              evergreenPct={evergreenPct}
              evergreenCount={evergreenCount}
              targetSlotCount={season.targetSkuCount}
              marginTarget={season.marginTarget}
              targetEvergreenPct={season.targetEvergreenPct}
              glossary={glossary}
            />
          </div>
        )}
      </div>
    </div>
  )
}
