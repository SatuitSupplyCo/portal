import type { BrandPalette } from "./types"

interface PhotographyColophonProps {
  palette: BrandPalette
}

export function PhotographyColophon({
  palette: { NAVY },
}: PhotographyColophonProps) {
  return (
    <footer
      style={{ backgroundColor: NAVY }}
      className="px-8 py-14 md:px-16"
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
          Section 7.0 &middot; Photography &amp; Art Direction
        </p>
        <p
          className="text-[11px] mt-3"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          If it looks like a postcard, don&rsquo;t shoot it.
        </p>
      </div>
    </footer>
  )
}
