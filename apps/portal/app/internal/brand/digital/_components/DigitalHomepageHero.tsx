import { Placeholder } from "@/components/brand/Placeholder"
import type { BrandPalette } from "./types"

interface DigitalHomepageHeroProps {
  palette: BrandPalette
}

export function DigitalHomepageHero({
  palette: { NAVY, GRANITE },
}: DigitalHomepageHeroProps) {
  return (
    <section
      style={{ backgroundColor: NAVY }}
      className="relative text-white px-8 py-16 md:px-16 md:py-20 overflow-hidden"
    >
      <div className="relative max-w-3xl">
        <h2
          id="homepage-hero"
          className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
        >
          Visual Reference
        </h2>
        <p
          className="text-sm uppercase tracking-[0.15em] font-semibold mb-10"
          style={{ color: GRANITE }}
        >
          The Homepage Hero
        </p>

        <p
          className="text-sm leading-relaxed mb-10 max-w-xl"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Imagine opening the website on a desktop. This is the first thing you
          see.
        </p>

        <div
          className="rounded-lg overflow-hidden"
          style={{ border: "1.5px solid rgba(255,255,255,0.08)" }}
        >
          <div
            className="flex items-center justify-center py-1.5"
            style={{
              backgroundColor: NAVY,
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span
              className="text-[9px] tracking-[0.1em]"
              style={{ color: "rgba(255,255,255,0.50)" }}
            >
              Free Shipping on Provisions over $150.
            </span>
          </div>

          <div
            className="flex items-center justify-between px-6 py-3"
            style={{ backgroundColor: "white" }}
          >
            <p
              className="text-xs font-bold tracking-[0.12em]"
              style={{ color: NAVY }}
            >
              SATUIT SUPPLY CO.
            </p>
            <div className="flex gap-5">
              {["SHOP", "ABOUT", "JOURNAL"].map((item) => (
                <span
                  key={item}
                  className="text-[10px] font-medium tracking-[0.08em]"
                  style={{ color: `${NAVY}70` }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div
            className="relative flex flex-col items-center justify-center py-24 md:py-32"
            style={{ backgroundColor: `${GRANITE}18` }}
          >
            <Placeholder
              variant="dark"
              label="Hero — Grey Harbor"
              note="Wide, cinematic shot of a grey harbor. Overcast, matte, textured."
              aspect="21 / 9"
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl md:text-4xl font-bold tracking-[0.2em] text-white mb-6">
                MADE FOR THE WATER.
              </p>
              <button
                type="button"
                className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.15em] text-white cursor-default"
                style={{ backgroundColor: NAVY, borderRadius: 0 }}
              >
                Shop the Collection
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
              style={{ color: "rgba(255,255,255,0.40)" }}
            >
              The Nav
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
              Minimal, white background, Navy text.
            </p>
          </div>
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
              style={{ color: "rgba(255,255,255,0.40)" }}
            >
              The Hero
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
              Wide, cinematic grey harbor shot.
            </p>
          </div>
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
              style={{ color: "rgba(255,255,255,0.40)" }}
            >
              The CTA
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
              Solid Navy button, 0px radius.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
