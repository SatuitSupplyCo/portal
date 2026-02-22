import type { BrandPalette } from "./types"

interface ColorPrimaryPaletteProps {
  palette: BrandPalette
}

export function ColorPrimaryPalette({
  palette: { NAVY, CANVAS, GRANITE },
}: ColorPrimaryPaletteProps) {
  return (
    <section className="bg-white px-8 py-16 md:px-16 md:py-24">
      <div className="max-w-3xl">
        <div
          className="text-[8rem] md:text-[10rem] font-bold leading-none select-none"
          style={{ color: NAVY, opacity: 0.03 }}
          aria-hidden
        >
          6.2
        </div>

        <h2
          id="primary-palette"
          className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-3"
          style={{ color: NAVY }}
        >
          The Primary Palette
        </h2>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3"
          style={{ color: `${NAVY}60` }}
        >
          The Atmosphere
        </p>
        <p className="text-sm mb-12" style={{ color: `${NAVY}AA` }}>
          Used for 90% of the brand presence&mdash;Store, Web, Packaging.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <div
            className="rounded-lg overflow-hidden border"
            style={{ borderColor: `${NAVY}10` }}
          >
            <div className="h-36" style={{ backgroundColor: NAVY }} />
            <div className="p-5">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-2"
                style={{ color: `${NAVY}60` }}
              >
                Dominant
              </p>
              <p className="text-base font-bold mb-1" style={{ color: NAVY }}>
                Satuit Navy
              </p>
              <p
                className="text-xs font-mono mb-1"
                style={{ color: `${NAVY}AA` }}
              >
                {NAVY}
              </p>
              <p
                className="text-[11px] mb-3"
                style={{ color: `${NAVY}80` }}
              >
                Pantone 289 C
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: `${NAVY}99` }}
              >
                &ldquo;Midnight.&rdquo; Richer, more premium, less sporty than
                the previous navy.
              </p>
            </div>
          </div>

          <div
            className="rounded-lg overflow-hidden border"
            style={{ borderColor: `${NAVY}10` }}
          >
            <div
              className="h-36 border-b"
              style={{
                backgroundColor: CANVAS,
                borderColor: `${NAVY}08`,
              }}
            />
            <div className="p-5">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-2"
                style={{ color: `${NAVY}60` }}
              >
                Sub-Dominant
              </p>
              <p className="text-base font-bold mb-1" style={{ color: NAVY }}>
                Canvas (Bone)
              </p>
              <p
                className="text-xs font-mono mb-1"
                style={{ color: `${NAVY}AA` }}
              >
                {CANVAS}
              </p>
              <p
                className="text-[11px] mb-3"
                style={{ color: `${NAVY}80` }}
              >
                Pantone Warm Gray 1 C
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: `${NAVY}99` }}
              >
                &ldquo;Stone / Sailcloth.&rdquo; Cooled down from the previous
                warm cream.
              </p>
            </div>
          </div>

          <div
            className="rounded-lg overflow-hidden border"
            style={{ borderColor: `${NAVY}10` }}
          >
            <div
              className="h-36"
              style={{ backgroundColor: GRANITE }}
            />
            <div className="p-5">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-2"
                style={{ color: `${NAVY}60` }}
              >
                Support
              </p>
              <p className="text-base font-bold mb-1" style={{ color: NAVY }}>
                Granite
              </p>
              <p
                className="text-xs font-mono mb-1"
                style={{ color: `${NAVY}AA` }}
              >
                {GRANITE}
              </p>
              <p
                className="text-[11px] mb-3"
                style={{ color: `${NAVY}80` }}
              >
                Pantone Cool Gray 7 C
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: `${NAVY}99` }}
              >
                The color of wet rock. For secondary text and lines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
