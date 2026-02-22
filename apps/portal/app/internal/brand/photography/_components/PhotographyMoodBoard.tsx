import { Placeholder } from "@/components/brand/Placeholder"
import type { BrandPalette } from "./types"

interface PhotographyMoodBoardProps {
  palette: BrandPalette
}

export function PhotographyMoodBoard({
  palette: { NAVY, GRANITE, SALT },
}: PhotographyMoodBoardProps) {
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
        7.6
      </span>

      <div className="relative max-w-3xl">
        <h2
          id="mood-board"
          className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
        >
          The Mood Board
        </h2>
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-10"
          style={{ color: GRANITE }}
        >
          Mental Reference
        </p>

        <p
          className="text-sm leading-relaxed mb-10 max-w-xl"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          If you need to explain the vibe to a creative partner, describe it
          like this:
        </p>

        <div
          className="border-l-2 pl-8 py-2 mb-14"
          style={{ borderColor: SALT }}
        >
          <p
            className="text-xl md:text-2xl leading-relaxed italic"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            &ldquo;Imagine a black-and-white photo of a boat builder from 1970,
            but colorized with just Navy, Grey, and the faded yellow of an old
            raincoat. It&rsquo;s quiet. It&rsquo;s early morning. There is salt
            on the lens.&rdquo;
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Placeholder
            variant="dark"
            label="Mood — Boat Builder"
            note="Black-and-white reference colorized with Navy and Grey. Quiet, early morning."
            aspect="4 / 5"
          />
          <Placeholder
            variant="dark"
            label="Mood — Salt & Grain"
            note="Close-up texture with film grain. Desaturated coastal tones."
            aspect="4 / 5"
          />
          <Placeholder
            variant="dark"
            label="Mood — Morning Fog"
            note="Harbour in overcast light. Muted palette, soft focus, no sun."
            aspect="4 / 5"
          />
        </div>
      </div>
    </section>
  )
}
