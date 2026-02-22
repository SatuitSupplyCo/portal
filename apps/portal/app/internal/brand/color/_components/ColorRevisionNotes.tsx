import type { BrandPalette } from "./types"

interface ColorRevisionNotesProps {
  palette: BrandPalette
}

export function ColorRevisionNotes({
  palette: { NAVY, CANVAS },
}: ColorRevisionNotesProps) {
  return (
    <section
      style={{ backgroundColor: NAVY }}
      className="text-white px-8 py-16 md:px-16 md:py-24"
    >
      <div className="max-w-3xl">
        <h2
          id="revision-notes"
          className="text-lg font-bold uppercase tracking-[0.1em] mb-3"
        >
          Revision Notes
        </h2>
        <p
          className="text-sm mb-10"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          Summary of changes from the previous color draft.
        </p>

        <div className="space-y-6">
          <div
            className="flex items-start gap-5 border-l-2 pl-6 py-1"
            style={{ borderColor: "rgba(255,255,255,0.15)" }}
          >
            <div>
              <p className="text-sm font-bold mb-1">Darkened the Navy</p>
              <p
                className="text-sm leading-[1.75]"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Moved from &ldquo;Royal/Bright&rdquo;{" "}
                <span
                  className="font-mono text-xs"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  #003C68
                </span>{" "}
                to &ldquo;Midnight/Deep&rdquo;{" "}
                <span className="font-mono text-xs text-white">{NAVY}</span>{" "}
                to align with &ldquo;Quiet Luxury.&rdquo;
              </p>
            </div>
          </div>

          <div
            className="flex items-start gap-5 border-l-2 pl-6 py-1"
            style={{ borderColor: "rgba(255,255,255,0.15)" }}
          >
            <div>
              <p className="text-sm font-bold mb-1">Cooled the White</p>
              <p
                className="text-sm leading-[1.75]"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Moved from &ldquo;Warm Paper&rdquo;{" "}
                <span
                  className="font-mono text-xs"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  #FFFCFA
                </span>{" "}
                to &ldquo;Stone Canvas&rdquo;{" "}
                <span className="font-mono text-xs text-white">{CANVAS}</span>{" "}
                to feel more coastal and weathered.
              </p>
            </div>
          </div>

          <div
            className="flex items-start gap-5 border-l-2 pl-6 py-1"
            style={{ borderColor: "rgba(255,255,255,0.15)" }}
          >
            <div>
              <p className="text-sm font-bold mb-1">
                Restricted the Red / Yellow
              </p>
              <p
                className="text-sm leading-[1.75]"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Kept them as vital DNA (Signal Flags) but strictly defined them
                as &ldquo;Utility Signals&rdquo; so they don&rsquo;t take over
                the brand look.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
