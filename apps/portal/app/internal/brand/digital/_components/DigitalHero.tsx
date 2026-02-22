import type { BrandPalette } from "./types"

interface DigitalHeroProps {
  palette: BrandPalette
}

export function DigitalHero({ palette: { NAVY } }: DigitalHeroProps) {
  return (
    <section
      style={{ backgroundColor: NAVY }}
      className="relative text-white px-8 py-20 md:px-16 md:py-28 overflow-hidden"
    >
      <span
        aria-hidden
        className="pointer-events-none select-none absolute -right-6 bottom-0 text-[20rem] font-bold leading-none"
        style={{ color: "rgba(255,255,255,0.02)" }}
      >
        10.0
      </span>

      <div className="relative max-w-3xl">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.35em] mb-8"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Section 10.0
        </p>
        <div
          className="w-10 h-px mb-10"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        />
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] mb-8">
          Digital Strategy
          <br />
          &amp; UI/UX
        </h1>
        <p
          className="text-base leading-relaxed max-w-xl"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          The website is not a store. It is a catalog. Every pixel must feel
          organized, archival, and utilitarian&mdash;a digital extension of the
          physical brand.
        </p>
      </div>
    </section>
  )
}
