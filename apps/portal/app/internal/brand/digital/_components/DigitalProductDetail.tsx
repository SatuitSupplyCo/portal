import { Placeholder } from "@/components/brand/Placeholder"
import type { BrandPalette } from "./types"

interface DigitalProductDetailProps {
  palette: BrandPalette
}

export function DigitalProductDetail({
  palette: { NAVY, GRANITE, SALT },
}: DigitalProductDetailProps) {
  return (
    <section
      style={{ backgroundColor: NAVY }}
      className="relative text-white px-8 py-16 md:px-16 md:py-20 overflow-hidden"
    >
      <span
        aria-hidden
        className="pointer-events-none select-none absolute -right-4 -top-10 text-[14rem] font-bold leading-none"
        style={{ color: "rgba(255,255,255,0.02)" }}
      >
        10.3
      </span>

      <div className="relative max-w-3xl">
        <h2
          id="product-detail"
          className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
        >
          The Product Detail Page
        </h2>
        <p
          className="text-sm uppercase tracking-[0.15em] font-semibold mb-10"
          style={{ color: GRANITE }}
        >
          The &ldquo;Spec Sheet&rdquo;
        </p>

        <p
          className="text-sm leading-relaxed mb-10 max-w-xl"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          We don&rsquo;t just sell a shirt; we explain the engineering. Every
          product page is structured as technical documentation.
        </p>

        <div
          className="rounded-lg overflow-hidden mb-10"
          style={{ border: "1.5px solid rgba(255,255,255,0.08)" }}
        >
          <div
            className="px-6 py-4"
            style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
          >
            <p className="text-lg md:text-xl font-bold tracking-[0.15em]">
              THE MERINO QUARTER-ZIP
            </p>
            <p
              className="text-[10px] mt-1 font-medium tracking-[0.1em]"
              style={{ color: "rgba(255,255,255,0.40)" }}
            >
              Montserrat Bold &middot; Wide Tracking
            </p>
          </div>

          <div
            id="pdp-specs"
            className="px-6 py-5"
            style={{
              backgroundColor: "rgba(255,255,255,0.02)",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
              style={{ color: SALT }}
            >
              Specifications
            </p>
            <div className="space-y-2 font-mono text-sm">
              {(
                [
                  ["MATERIAL", "400gsm French Terry"],
                  ["ORIGIN", "Milled in Portugal"],
                  ["FIT", "Standard / Room for layering"],
                  ["CARE", "Cold Wash / Line Dry"],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex gap-4">
                  <span
                    className="w-24 shrink-0"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {label}:
                  </span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <h3 id="pdp-imagery" className="text-lg font-bold mb-6">
          The Imagery
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
              style={{ color: SALT }}
            >
              Hero
            </p>
            <Placeholder
              variant="dark"
              label="PDP — Flat Lay"
              note="Whole product on canvas surface. Clean, squared-off frame."
              aspect="1 / 1"
            />
          </div>
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
              style={{ color: SALT }}
            >
              Detail
            </p>
            <Placeholder
              variant="dark"
              label="PDP — Texture"
              note="Macro shot of fabric or stitch detail. Show the engineering."
              aspect="1 / 1"
            />
          </div>
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
              style={{ color: SALT }}
            >
              On-Body
            </p>
            <Placeholder
              variant="dark"
              label="PDP — Fit"
              note="Headless or 'looking away' shot showing fit and drape."
              aspect="1 / 1"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
