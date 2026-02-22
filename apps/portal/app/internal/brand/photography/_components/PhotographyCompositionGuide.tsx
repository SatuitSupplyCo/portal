import { Placeholder } from "@/components/brand/Placeholder"
import type { BrandPalette } from "./types"

interface PhotographyCompositionGuideProps {
  palette: BrandPalette
}

export function PhotographyCompositionGuide({
  palette: { NAVY, CANVAS, STORM },
}: PhotographyCompositionGuideProps) {
  return (
    <section
      style={{ backgroundColor: CANVAS }}
      className="relative px-8 py-16 md:px-16 md:py-20 overflow-hidden"
    >
      <span
        aria-hidden
        className="pointer-events-none select-none absolute -right-4 -top-10 text-[14rem] font-bold leading-none"
        style={{ color: `${NAVY}03` }}
      >
        7.4
      </span>

      <div className="relative max-w-3xl">
        <h2
          id="composition"
          className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
          style={{ color: NAVY }}
        >
          Composition Guide
        </h2>
        <p
          className="text-sm leading-relaxed mb-12 max-w-xl"
          style={{ color: `${NAVY}88` }}
        >
          We use the &ldquo;Rule of Thirds&rdquo; to maintain our
          &ldquo;Quiet Luxury&rdquo; aesthetic. Every frame should breathe.
        </p>

        <div className="space-y-8">
          <div
            className="rounded-lg p-6"
            style={{ backgroundColor: "white", border: `1.5px solid ${NAVY}08` }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: NAVY }}
            >
              Negative Space
            </p>
            <p
              className="text-base leading-relaxed mb-2"
              style={{ color: `${NAVY}cc` }}
            >
              Leave &ldquo;air&rdquo; in the photo. Do not clutter the frame.
              This mimics the wide tracking in our typography.
            </p>
          </div>

          <div
            className="rounded-lg p-6"
            style={{ backgroundColor: "white", border: `1.5px solid ${NAVY}08` }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: NAVY }}
            >
              Asymmetry
            </p>
            <p
              className="text-base leading-relaxed mb-2"
              style={{ color: `${NAVY}cc` }}
            >
              Place the subject off-center. It feels more natural and less
              staged. The eye should wander, not be directed.
            </p>
          </div>

          <div
            className="rounded-lg p-6"
            style={{ backgroundColor: "white", border: `1.5px solid ${NAVY}08` }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: STORM }}
            >
              Straight Lines
            </p>
            <p
              className="text-base leading-relaxed mb-2"
              style={{ color: `${NAVY}cc` }}
            >
              Horizon lines must be perfectly straight. We are a
              &ldquo;Standard,&rdquo; and standards are level.
            </p>
          </div>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-4">
          <Placeholder
            label="Composition — Negative Space"
            note="Subject occupying one-third of frame. Open sky or water filling remaining space."
          />
          <Placeholder
            label="Composition — Off-Center"
            note="Subject placed asymmetrically using rule of thirds. Horizon perfectly level."
          />
        </div>
      </div>
    </section>
  )
}
