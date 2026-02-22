import type { BrandPalette } from "./types"

interface PhotographyHeroProps {
  palette: BrandPalette
}

export function PhotographyHero({ palette: { NAVY } }: PhotographyHeroProps) {
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
        7.0
      </span>

      <div className="relative max-w-3xl">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.35em] mb-8"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Section 7.0
        </p>
        <div
          className="w-10 h-px mb-10"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        />
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] mb-8">
          Photography
          <br />
          &amp; Art Direction
        </h1>
        <p
          className="text-base leading-relaxed max-w-xl"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          We don&rsquo;t capture aspiration. We capture texture, grain, and the
          matte finish of real life. Every image must feel like it was found,
          not staged.
        </p>
      </div>
    </section>
  )
}
