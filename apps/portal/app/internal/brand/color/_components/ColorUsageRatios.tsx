import type { BrandPalette } from "./types"

interface ColorUsageRatiosProps {
  palette: BrandPalette
}

export function ColorUsageRatios({
  palette: { NAVY, CANVAS, GRANITE, STORM, SALT, YELLOW },
}: ColorUsageRatiosProps) {
  return (
    <section
      style={{ backgroundColor: CANVAS }}
      className="px-8 py-16 md:px-16 md:py-24"
    >
      <div className="max-w-3xl">
        <div
          className="text-[8rem] md:text-[10rem] font-bold leading-none select-none"
          style={{ color: NAVY, opacity: 0.04 }}
          aria-hidden
        >
          6.4
        </div>

        <h2
          id="usage-ratios"
          className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-3"
          style={{ color: NAVY }}
        >
          Usage Ratios
        </h2>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-10"
          style={{ color: `${NAVY}60` }}
        >
          The &ldquo;Quiet&rdquo; Formula
        </p>

        <div
          className="flex h-4 rounded-full overflow-hidden mb-10"
          style={{ border: `1px solid ${NAVY}10` }}
        >
          <div style={{ width: "85%", backgroundColor: NAVY }} />
          <div style={{ width: "5%", backgroundColor: CANVAS }} />
          <div style={{ width: "5%", backgroundColor: GRANITE }} />
          <div style={{ width: "2.5%", backgroundColor: SALT }} />
          <div style={{ width: "1.5%", backgroundColor: STORM }} />
          <div style={{ width: "1%", backgroundColor: YELLOW }} />
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-5">
            <span
              className="text-3xl md:text-4xl font-bold shrink-0 w-20 text-right"
              style={{ color: NAVY }}
            >
              85%
            </span>
            <div className="pt-2">
              <p className="text-sm font-bold mb-1" style={{ color: NAVY }}>
                Navy + Canvas
              </p>
              <p className="text-sm" style={{ color: `${NAVY}AA` }}>
                The foundation. The house.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-5">
            <span
              className="text-3xl md:text-4xl font-bold shrink-0 w-20 text-right"
              style={{ color: GRANITE }}
            >
              10%
            </span>
            <div className="pt-2">
              <p className="text-sm font-bold mb-1" style={{ color: NAVY }}>
                Granite / Salt Air
              </p>
              <p className="text-sm" style={{ color: `${NAVY}AA` }}>
                The texture. The fog and sky.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-5">
            <span
              className="text-3xl md:text-4xl font-bold shrink-0 w-20 text-right"
              style={{ color: STORM }}
            >
              5%
            </span>
            <div className="pt-2">
              <p className="text-sm font-bold mb-1" style={{ color: NAVY }}>
                Red / Yellow
              </p>
              <p className="text-sm" style={{ color: `${NAVY}AA` }}>
                The signal. The spark.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
