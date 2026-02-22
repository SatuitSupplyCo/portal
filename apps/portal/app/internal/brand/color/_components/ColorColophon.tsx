import type { BrandPalette } from "./types"

interface ColorColophonProps {
  palette: BrandPalette
}

export function ColorColophon({ palette: { NAVY } }: ColorColophonProps) {
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
          Satuit Supply Co. &middot; Brand Operating System &middot; Section
          6.0
        </p>
        <p
          className="text-[11px] mt-3"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          Color Architecture is binding. All hex values are final.
        </p>
      </div>
    </footer>
  )
}
