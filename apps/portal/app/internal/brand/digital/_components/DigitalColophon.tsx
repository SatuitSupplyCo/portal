import type { BrandPalette } from "./types"

interface DigitalColophonProps {
  palette: BrandPalette
}

export function DigitalColophon({ palette: { NAVY } }: DigitalColophonProps) {
  return (
    <footer
      style={{ backgroundColor: NAVY }}
      className="text-white px-8 py-14 md:px-16"
    >
      <div className="max-w-3xl">
        <div
          className="w-8 h-px mb-8"
          style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
        />
        <p
          className="text-[11px] uppercase tracking-[0.3em]"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Section 10.0 &middot; Digital Strategy &amp; UI/UX
        </p>
        <p
          className="text-[11px] mt-3"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          The website is a catalog, not a store.
        </p>
      </div>
    </footer>
  )
}
