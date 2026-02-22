import type { BrandPalette } from "./types"

interface ColorUtilityPaletteProps {
  palette: BrandPalette
}

export function ColorUtilityPalette({
  palette: { NAVY, STORM, YELLOW, SALT },
}: ColorUtilityPaletteProps) {
  return (
    <section
      style={{ backgroundColor: NAVY }}
      className="text-white px-8 py-16 md:px-16 md:py-24"
    >
      <div className="max-w-3xl">
        <div
          className="text-[8rem] md:text-[10rem] font-bold leading-none select-none"
          style={{ color: "rgba(255,255,255,0.03)" }}
          aria-hidden
        >
          6.3
        </div>

        <h2
          id="utility-palette"
          className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-3"
        >
          The Utility Palette
        </h2>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          The Signals
        </p>
        <p
          className="text-sm mb-14"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Used for 5&ndash;10% of the brand. &ldquo;Heritage Colors&rdquo;
          inspired by signal flags and the sky. They add life without
          destroying the quiet luxury.
        </p>

        <div className="space-y-10">
          <div className="flex items-start gap-6">
            <div
              className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full"
              style={{ backgroundColor: STORM }}
            />
            <div>
              <div className="flex items-baseline gap-3 mb-1">
                <p className="text-base font-bold">Storm Red</p>
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.15em]"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Signal A
                </span>
              </div>
              <p
                className="text-xs font-mono mb-3"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {STORM}
              </p>
              <p
                className="text-sm leading-[1.75]"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Use for &ldquo;Sale&rdquo; prices, the inside neck tape stitch,
                or a single &ldquo;red flag&rdquo; hem tag.{" "}
                <strong className="text-white font-semibold">
                  Never a background.
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div
              className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full"
              style={{ backgroundColor: YELLOW }}
            />
            <div>
              <div className="flex items-baseline gap-3 mb-1">
                <p className="text-base font-bold">Warning Yellow</p>
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.15em]"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Signal B
                </span>
              </div>
              <p
                className="text-xs font-mono mb-3"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {YELLOW}
              </p>
              <p
                className="text-sm leading-[1.75]"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Use for &ldquo;New Arrival&rdquo; badges or technical zipper
                pulls. Think &ldquo;Oilskin,&rdquo; not &ldquo;Lemon.&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div
              className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full"
              style={{ backgroundColor: SALT }}
            />
            <div>
              <div className="flex items-baseline gap-3 mb-1">
                <p className="text-base font-bold">Salt Air</p>
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.15em]"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Element
                </span>
              </div>
              <p
                className="text-xs font-mono mb-3"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {SALT}
              </p>
              <p
                className="text-sm leading-[1.75]"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Use for tissue paper, seasonal shirt colors, or to soften a
                stark layout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
