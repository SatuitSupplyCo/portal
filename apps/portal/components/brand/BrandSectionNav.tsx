import Link from "next/link"

// ─── Section order ──────────────────────────────────────────────────

const NAVY = "#0A1E36"

const sections = [
  { num: "1.0", title: "Foundations", href: "/internal/brand/foundations" },
  { num: "2.0", title: "Messaging System", href: "/internal/brand/messaging" },
  { num: "3.0", title: "Visual Standards", href: "/internal/brand/visual" },
  { num: "4.0", title: "Typography", href: "/internal/brand/typography" },
  { num: "5.0", title: "Voice & Ethos", href: "/internal/brand/voice" },
  { num: "6.0", title: "Color Architecture", href: "/internal/brand/color" },
  { num: "7.0", title: "Photography", href: "/internal/brand/photography" },
  { num: "8.0", title: "Trim & Hardware", href: "/internal/brand/trim" },
  { num: "9.0", title: "Packaging & Logistics", href: "/internal/brand/logistics" },
  { num: "10.0", title: "Digital Strategy", href: "/internal/brand/digital" },
]

const INDEX = { num: "", title: "Brand System", href: "/internal/brand" }

// ─── Component ──────────────────────────────────────────────────────

interface BrandSectionNavProps {
  current: string
}

export function BrandSectionNav({ current }: BrandSectionNavProps) {
  const idx = sections.findIndex((s) => s.href === current)
  const prev = idx > 0 ? sections[idx - 1]! : INDEX
  const next = idx < sections.length - 1 ? sections[idx + 1]! : INDEX

  return (
    <nav
      style={{ backgroundColor: NAVY }}
      className="px-8 md:px-16"
    >
      <div
        className="max-w-3xl py-10"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-start justify-between gap-8">
          {/* Previous */}
          <Link
            href={prev.href}
            className="group flex flex-col items-start gap-1 text-white"
          >
            <span
              className="text-[10px] font-medium uppercase tracking-[0.2em] transition-colors group-hover:text-white"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              &larr; Previous
            </span>
            <span className="flex items-baseline gap-2">
              {prev.num && (
                <span
                  className="text-[11px] font-bold"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  {prev.num}
                </span>
              )}
              <span className="text-sm font-medium group-hover:underline decoration-1 underline-offset-4">
                {prev.title}
              </span>
            </span>
          </Link>

          {/* Next */}
          <Link
            href={next.href}
            className="group flex flex-col items-end gap-1 text-white text-right"
          >
            <span
              className="text-[10px] font-medium uppercase tracking-[0.2em] transition-colors group-hover:text-white"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Next &rarr;
            </span>
            <span className="flex items-baseline gap-2">
              {next.num && (
                <span
                  className="text-[11px] font-bold"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  {next.num}
                </span>
              )}
              <span className="text-sm font-medium group-hover:underline decoration-1 underline-offset-4">
                {next.title}
              </span>
            </span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
