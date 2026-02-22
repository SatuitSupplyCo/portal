import type { BrandPalette } from "./types"

interface ColorHeroProps {
  palette: BrandPalette
}

export function ColorHero({ palette: { NAVY } }: ColorHeroProps) {
  return (
    <section
      style={{ backgroundColor: NAVY }}
      className="text-white px-8 py-20 md:px-16 md:py-28"
    >
      <div className="max-w-3xl">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.35em] mb-8"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Satuit Supply Co.
        </p>
        <div
          className="w-10 h-px mb-10"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        />
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] mb-10">
          Color
          <br />
          Architecture
        </h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium uppercase tracking-[0.2em]">
            Section 6.0
          </span>
          <span style={{ color: "rgba(255,255,255,0.25)" }}>&mdash;</span>
          <span
            className="uppercase tracking-[0.15em]"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Brand Operating System
          </span>
        </div>
      </div>
    </section>
  )
}
