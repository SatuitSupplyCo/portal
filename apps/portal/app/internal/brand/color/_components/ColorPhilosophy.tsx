import type { BrandPalette } from "./types"

interface ColorPhilosophyProps {
  palette: BrandPalette
}

export function ColorPhilosophy({
  palette: { NAVY, CANVAS },
}: ColorPhilosophyProps) {
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
          6.1
        </div>

        <h2
          id="philosophy"
          className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-3"
          style={{ color: NAVY }}
        >
          The Philosophy
        </h2>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-10"
          style={{ color: `${NAVY}60` }}
        >
          &ldquo;Hull &amp; Flag&rdquo;
        </p>

        <p
          className="text-base leading-[1.85] mb-10"
          style={{ color: NAVY }}
        >
          A ship is painted in neutral, industrial tones&mdash;Navy, Grey,
          White&mdash;to survive the ocean. The only bright colors on a ship
          are the signal flags and safety gear.
        </p>

        <div
          className="border-l-4 pl-6 md:pl-8 py-3"
          style={{ borderColor: NAVY }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3"
            style={{ color: `${NAVY}70` }}
          >
            The Rule
          </p>
          <p
            className="text-lg md:text-xl font-bold leading-snug"
            style={{ color: NAVY }}
          >
            The brand is the Hull{" "}
            <span className="font-normal" style={{ color: `${NAVY}80` }}>
              (Neutral).
            </span>
            <br />
            The accents are the Flags{" "}
            <span className="font-normal" style={{ color: `${NAVY}80` }}>
              (Functional).
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
