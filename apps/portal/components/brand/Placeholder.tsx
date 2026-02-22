const NAVY = "#0A1E36"

export function Placeholder({
  label,
  note,
  variant = "light",
  aspect = "3 / 2",
}: {
  label: string
  note: string
  variant?: "light" | "dark"
  aspect?: string
}) {
  const light = variant === "light"
  return (
    <div
      className="rounded-lg flex flex-col items-center justify-center text-center px-6"
      style={{
        aspectRatio: aspect,
        backgroundColor: light ? `${NAVY}06` : "rgba(255,255,255,0.03)",
        border: light
          ? `1.5px dashed ${NAVY}12`
          : "1.5px dashed rgba(255,255,255,0.10)",
      }}
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center mb-4"
        style={{
          border: light
            ? `1.5px dashed ${NAVY}18`
            : "1.5px dashed rgba(255,255,255,0.12)",
        }}
      >
        <span
          className="text-base"
          style={{ color: light ? `${NAVY}25` : "rgba(255,255,255,0.18)" }}
        >
          &#9671;
        </span>
      </div>
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-1"
        style={{ color: light ? `${NAVY}50` : "rgba(255,255,255,0.40)" }}
      >
        {label}
      </p>
      <p
        className="text-[10px] max-w-[220px]"
        style={{ color: light ? `${NAVY}35` : "rgba(255,255,255,0.25)" }}
      >
        {note}
      </p>
    </div>
  )
}
