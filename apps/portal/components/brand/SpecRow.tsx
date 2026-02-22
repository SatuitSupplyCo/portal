const NAVY = "#0A1E36"

export function SpecRow({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div
      className="flex items-baseline gap-4 py-3"
      style={{ borderBottom: `1px solid ${NAVY}08` }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-[0.15em] w-28 shrink-0"
        style={{ color: `${NAVY}50` }}
      >
        {label}
      </p>
      <p
        className="text-sm font-medium"
        style={{ color: accent ?? NAVY }}
      >
        {value}
      </p>
    </div>
  )
}
