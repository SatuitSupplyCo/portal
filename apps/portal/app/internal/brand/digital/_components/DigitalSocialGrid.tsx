import type { BrandPalette } from "./types"

interface DigitalSocialGridProps {
  palette: BrandPalette
}

export function DigitalSocialGrid({
  palette: { NAVY, CANVAS, GRANITE, STORM, SALT },
}: DigitalSocialGridProps) {
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
        10.4
      </span>

      <div className="relative max-w-3xl">
        <h2
          id="social-grid"
          className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
          style={{ color: NAVY }}
        >
          The Social Grid
        </h2>
        <p
          className="text-sm uppercase tracking-[0.15em] font-semibold mb-10"
          style={{ color: GRANITE }}
        >
          &ldquo;The Field Log&rdquo;
        </p>

        <p
          className="text-base leading-relaxed mb-10 max-w-xl"
          style={{ color: `${NAVY}cc` }}
        >
          Instagram is not a billboard; it is a documentation of life near the
          water. We treat it like a field reporter&rsquo;s notebook.
        </p>

        <p
          className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5"
          style={{ color: NAVY }}
        >
          The Rhythm (3-3-3 Rule)
        </p>
        <p
          className="text-sm leading-relaxed mb-6"
          style={{ color: `${NAVY}88` }}
        >
          For every 9 posts, aim for this balance:
        </p>

        <div className="grid grid-cols-3 gap-2 mb-10">
          {[1, 2, 3].map((n) => (
            <div
              key={`product-${n}`}
              className="flex flex-col items-center justify-center text-center p-3"
              style={{
                aspectRatio: "1 / 1",
                backgroundColor: "white",
                border: `1.5px solid ${NAVY}08`,
                borderRadius: 8,
              }}
            >
              <span className="text-2xl mb-2" style={{ color: `${NAVY}15` }}>
                &#9671;
              </span>
              <p
                className="text-[9px] font-bold uppercase tracking-[0.1em]"
                style={{ color: NAVY }}
              >
                Product
              </p>
              <p className="text-[8px] mt-0.5" style={{ color: `${NAVY}50` }}>
                The &ldquo;Supply&rdquo;
              </p>
            </div>
          ))}
          {[1, 2, 3].map((n) => (
            <div
              key={`lifestyle-${n}`}
              className="flex flex-col items-center justify-center text-center p-3"
              style={{
                aspectRatio: "1 / 1",
                backgroundColor: `${SALT}10`,
                border: `1.5px solid ${SALT}20`,
                borderRadius: 8,
              }}
            >
              <span className="text-2xl mb-2" style={{ color: `${SALT}40` }}>
                &#9671;
              </span>
              <p
                className="text-[9px] font-bold uppercase tracking-[0.1em]"
                style={{ color: NAVY }}
              >
                Lifestyle
              </p>
              <p className="text-[8px] mt-0.5" style={{ color: `${NAVY}50` }}>
                The &ldquo;Life&rdquo;
              </p>
            </div>
          ))}
          {[1, 2, 3].map((n) => (
            <div
              key={`texture-${n}`}
              className="flex flex-col items-center justify-center text-center p-3"
              style={{
                aspectRatio: "1 / 1",
                backgroundColor: `${GRANITE}10`,
                border: `1.5px solid ${GRANITE}20`,
                borderRadius: 8,
              }}
            >
              <span className="text-2xl mb-2" style={{ color: `${GRANITE}40` }}>
                &#9671;
              </span>
              <p
                className="text-[9px] font-bold uppercase tracking-[0.1em]"
                style={{ color: NAVY }}
              >
                Texture
              </p>
              <p className="text-[8px] mt-0.5" style={{ color: `${NAVY}50` }}>
                The &ldquo;Place&rdquo;
              </p>
            </div>
          ))}
        </div>

        <p
          className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5"
          style={{ color: NAVY }}
        >
          The Caption Style
        </p>
        <p className="text-sm font-bold mb-5" style={{ color: `${NAVY}cc` }}>
          Short. Factual. Grounded.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div
            className="rounded-lg p-5"
            style={{
              backgroundColor: `${STORM}06`,
              border: `1.5px solid ${STORM}12`,
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: STORM }}
            >
              Don&rsquo;t Write
            </p>
            <p
              className="text-sm italic leading-relaxed"
              style={{ color: `${NAVY}88` }}
            >
              &ldquo;Loving these vibes! &#127754;&#10024; #coastal&rdquo;
            </p>
          </div>

          <div
            className="rounded-lg p-5"
            style={{
              backgroundColor: `${NAVY}04`,
              border: `1.5px solid ${NAVY}10`,
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: NAVY }}
            >
              Do Write
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: `${NAVY}cc` }}
            >
              &ldquo;The Quarter-Zip in Navy. Built for the variable conditions
              of the shoulder season. Link in bio.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
