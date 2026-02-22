import { InfoTooltip, type GlossaryEntry } from "@/components/InfoTooltip"

interface MetricBlockProps {
  label: string
  value: string | number
  glossarySlug?: string
  glossary?: Record<string, GlossaryEntry>
}

export function MetricBlock({ label, value, glossarySlug, glossary }: MetricBlockProps) {
  return (
    <div>
      <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider flex items-center gap-1">
        {label}
        {glossarySlug && glossary && <InfoTooltip slug={glossarySlug} glossary={glossary} />}
      </p>
      <p className="text-sm font-medium text-[var(--depot-ink)] tabular-nums mt-0.5">{String(value)}</p>
    </div>
  )
}
