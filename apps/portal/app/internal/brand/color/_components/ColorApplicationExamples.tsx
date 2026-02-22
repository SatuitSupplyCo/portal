import type { BrandPalette } from "./types"

interface ColorApplicationExamplesProps {
  palette: BrandPalette
}

export function ColorApplicationExamples({
  palette: { NAVY, STORM, YELLOW, SALT },
}: ColorApplicationExamplesProps) {
  return (
    <section className="bg-white px-8 py-16 md:px-16 md:py-24">
      <div className="max-w-3xl">
        <div
          className="text-[8rem] md:text-[10rem] font-bold leading-none select-none"
          style={{ color: NAVY, opacity: 0.03 }}
          aria-hidden
        >
          6.5
        </div>

        <h2
          id="application-examples"
          className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-3"
          style={{ color: NAVY }}
        >
          Application Examples
        </h2>
        <p className="text-sm mb-14" style={{ color: `${NAVY}AA` }}>
          How to use the accents. This is where &ldquo;Room for
          Expansion&rdquo; happens without losing control.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div
            id="app-web"
            className="border rounded-lg overflow-hidden"
            style={{ borderColor: `${NAVY}10` }}
          >
            <div
              className="px-6 py-4"
              style={{ backgroundColor: `${NAVY}04` }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.15em]"
                style={{ color: `${NAVY}50` }}
              >
                A
              </p>
              <p className="text-base font-bold" style={{ color: NAVY }}>
                The Web Design
              </p>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1"
                  style={{ color: `${NAVY}60` }}
                >
                  Background
                </p>
                <p style={{ color: NAVY }}>Canvas or White</p>
              </div>
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1"
                  style={{ color: `${NAVY}60` }}
                >
                  Text &amp; Buttons
                </p>
                <p style={{ color: NAVY }}>Satuit Navy</p>
              </div>
              <div
                className="border-t pt-4"
                style={{ borderColor: `${NAVY}08` }}
              >
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-2"
                  style={{ color: `${NAVY}60` }}
                >
                  The &ldquo;Accent&rdquo; Moment
                </p>
                <p
                  className="text-sm leading-[1.75]"
                  style={{ color: `${NAVY}CC` }}
                >
                  &ldquo;Sold Out&rdquo; or &ldquo;Low Stock&rdquo; notification
                  dot in{" "}
                  <strong
                    className="font-semibold"
                    style={{ color: YELLOW }}
                  >
                    Warning Yellow
                  </strong>
                  . &ldquo;Final Sale&rdquo; price text in{" "}
                  <strong
                    className="font-semibold"
                    style={{ color: STORM }}
                  >
                    Storm Red
                  </strong>
                  . Functional color coding&mdash;just like on a ship.
                </p>
              </div>
            </div>
          </div>

          <div
            id="app-garment"
            className="border rounded-lg overflow-hidden"
            style={{ borderColor: `${NAVY}10` }}
          >
            <div
              className="px-6 py-4"
              style={{ backgroundColor: `${NAVY}04` }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.15em]"
                style={{ color: `${NAVY}50` }}
              >
                B
              </p>
              <p className="text-base font-bold" style={{ color: NAVY }}>
                The Garment Design
              </p>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1"
                  style={{ color: `${NAVY}60` }}
                >
                  The Shirt
                </p>
                <p style={{ color: NAVY }}>A Heather Gray tee</p>
              </div>
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1"
                  style={{ color: `${NAVY}60` }}
                >
                  The Neck Tape
                </p>
                <p style={{ color: NAVY }}>Canvas (Natural)</p>
              </div>
              <div
                className="border-t pt-4"
                style={{ borderColor: `${NAVY}08` }}
              >
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-2"
                  style={{ color: `${NAVY}60` }}
                >
                  The &ldquo;Wink&rdquo;
                </p>
                <p
                  className="text-sm leading-[1.75] mb-3"
                  style={{ color: `${NAVY}CC` }}
                >
                  The single stitch holding the hem tag is{" "}
                  <strong
                    className="font-semibold"
                    style={{ color: STORM }}
                  >
                    Storm Red
                  </strong>
                  . Or the aglets of the hoodie drawstrings are dipped in{" "}
                  <strong
                    className="font-semibold"
                    style={{ color: YELLOW }}
                  >
                    Warning Yellow
                  </strong>
                  .
                </p>
              </div>
              <div
                className="border-t pt-4"
                style={{ borderColor: `${NAVY}08` }}
              >
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-2"
                  style={{ color: `${NAVY}60` }}
                >
                  Expansion
                </p>
                <p
                  className="text-sm leading-[1.75]"
                  style={{ color: `${NAVY}CC` }}
                >
                  In Summer, release a collection in{" "}
                  <strong
                    className="font-semibold"
                    style={{ color: SALT }}
                  >
                    Salt Air
                  </strong>
                  . Because it&rsquo;s in your palette, it fits
                  perfectly&mdash;but you don&rsquo;t change your website
                  header to match it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
