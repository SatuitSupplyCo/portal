import { Placeholder } from "@/components/brand/Placeholder"
import type { BrandPalette } from "./types"

interface PhotographyThreePillarsProps {
  palette: BrandPalette
}

export function PhotographyThreePillars({
  palette: { NAVY, GRANITE, STORM },
}: PhotographyThreePillarsProps) {
  return (
    <section
      style={{ backgroundColor: "white" }}
      className="relative px-8 py-16 md:px-16 md:py-20 overflow-hidden"
    >
      <span
        aria-hidden
        className="pointer-events-none select-none absolute -right-4 -top-10 text-[14rem] font-bold leading-none"
        style={{ color: `${NAVY}03` }}
      >
        7.2
      </span>

      <div className="relative max-w-3xl">
        <h2
          id="three-pillars"
          className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
          style={{ color: NAVY }}
        >
          The Three Pillars of Imagery
        </h2>
        <p
          className="text-sm leading-relaxed mb-12 max-w-xl"
          style={{ color: `${NAVY}88` }}
        >
          Every shoot must deliver a mix of these three categories. They work
          together to tell the complete Satuit story.
        </p>

        <div className="mb-14">
          <div className="flex items-baseline gap-4 mb-2">
            <span
              className="text-5xl font-bold leading-none"
              style={{ color: `${NAVY}08` }}
            >
              A
            </span>
            <div>
              <h3
                id="pillar-supply"
                className="text-xl font-bold"
                style={{ color: NAVY }}
              >
                Product Construction
              </h3>
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.2em] mt-1"
                style={{ color: GRANITE }}
              >
                The &ldquo;Supply&rdquo; Shot
              </p>
            </div>
          </div>

          <div className="ml-0 md:ml-14 mt-4">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                  style={{ color: `${NAVY}50` }}
                >
                  Subject
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: `${NAVY}cc` }}
                >
                  The garment is the hero.
                </p>
              </div>
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                  style={{ color: `${NAVY}50` }}
                >
                  Style
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: `${NAVY}cc` }}
                >
                  Flat lays on natural surfaces (weathered teak, granite slab,
                  canvas drop cloth) or &ldquo;Ghost Mannequin&rdquo; styling.
                </p>
              </div>
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                  style={{ color: `${NAVY}50` }}
                >
                  Focus
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: `${NAVY}cc` }}
                >
                  Macro details. Show the zipper pull. Show the flat-lock
                  stitch. Show the weight of the French Terry.
                </p>
              </div>
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                  style={{ color: `${NAVY}50` }}
                >
                  Why
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: `${NAVY}cc` }}
                >
                  This proves &ldquo;Well-Made.&rdquo; We sell specs, not just
                  &ldquo;vibes.&rdquo;
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Placeholder
                label="Flat Lay — Garment Hero"
                note="Product laid on weathered teak or canvas. Macro focus on fabric weight and construction."
              />
              <Placeholder
                label="Detail — Construction Close-up"
                note="Zipper pull, flat-lock stitch, or French Terry weight at macro distance."
                aspect="1 / 1"
              />
            </div>
          </div>
        </div>

        <div className="mb-14">
          <div className="flex items-baseline gap-4 mb-2">
            <span
              className="text-5xl font-bold leading-none"
              style={{ color: `${NAVY}08` }}
            >
              B
            </span>
            <div>
              <h3
                id="pillar-lifestyle"
                className="text-xl font-bold"
                style={{ color: NAVY }}
              >
                The &ldquo;Anti-Pose&rdquo; Lifestyle
              </h3>
            </div>
          </div>

          <div className="ml-0 md:ml-14 mt-4">
            <div
              className="rounded-lg p-5 mb-6"
              style={{
                backgroundColor: `${NAVY}03`,
                border: `1.5px solid ${NAVY}06`,
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
                style={{ color: STORM }}
              >
                The Rule
              </p>
              <p className="text-base font-bold" style={{ color: NAVY }}>
                Never look at the camera.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                  style={{ color: `${NAVY}50` }}
                >
                  Subject
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: `${NAVY}cc` }}
                >
                  People doing things, not modeling things.
                </p>
              </div>
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                  style={{ color: `${NAVY}50` }}
                >
                  Action
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: `${NAVY}cc` }}
                >
                  Catch them in the middle of a task: coiling a line, walking
                  the dog, loading a truck, looking at the horizon.
                </p>
              </div>
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                  style={{ color: `${NAVY}50` }}
                >
                  Emotion
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: `${NAVY}cc` }}
                >
                  Calm, focused, solitary. No fake laughing at salads.
                </p>
              </div>
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                  style={{ color: `${NAVY}50` }}
                >
                  Crop
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: `${NAVY}cc` }}
                >
                  Don&rsquo;t be afraid to crop heads off. Focus on the hands,
                  the shoulders, the movement of the fabric.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Placeholder
                label="Lifestyle — Mid-Task"
                note="Subject coiling a dock line or walking — never posing, never looking at camera."
                aspect="4 / 5"
              />
              <Placeholder
                label="Lifestyle — Hands"
                note="Tight crop on hands and fabric in motion. Head may be cropped out."
                aspect="4 / 5"
              />
              <Placeholder
                label="Lifestyle — Horizon"
                note="Solitary figure looking away. Calm, focused, natural posture."
                aspect="4 / 5"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-4 mb-2">
            <span
              className="text-5xl font-bold leading-none"
              style={{ color: `${NAVY}08` }}
            >
              C
            </span>
            <div>
              <h3
                id="pillar-place"
                className="text-xl font-bold"
                style={{ color: NAVY }}
              >
                Environmental Texture
              </h3>
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.2em] mt-1"
                style={{ color: GRANITE }}
              >
                The &ldquo;Place&rdquo;
              </p>
            </div>
          </div>

          <div className="ml-0 md:ml-14 mt-4">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                  style={{ color: `${NAVY}50` }}
                >
                  Subject
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: `${NAVY}cc` }}
                >
                  The raw materials of the coast.
                </p>
              </div>
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                  style={{ color: `${NAVY}50` }}
                >
                  Elements
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: `${NAVY}cc` }}
                >
                  Wet granite, grey shingles, peeling paint, cold water, fog.
                </p>
              </div>
            </div>

            <p
              className="text-sm leading-relaxed mb-6 max-w-lg"
              style={{ color: `${NAVY}88` }}
            >
              This grounds the brand in reality. It provides the
              &ldquo;Canvas&rdquo; for the Navy products to sit against.
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <Placeholder
                label="Texture — Granite"
                note="Wet or dry stone surface. Close crop showing grain and salt residue."
              />
              <Placeholder
                label="Texture — Shingles"
                note="Weathered cedar shingles, peeling paint, grey-on-grey tones."
              />
              <Placeholder
                label="Texture — Water"
                note="Cold water, fog, overcast harbor. Muted palette, no tropical blue."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
