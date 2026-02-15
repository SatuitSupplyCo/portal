"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@repo/ui/utils"
import { PrinterIcon } from "lucide-react"
import { skuGroups, packMeta, TECHPACK_BASE } from "@/lib/content/launch-v1"

// ─── Navigation structure ────────────────────────────────────────────

const frontMatter = [
  { label: "Cover", href: `${TECHPACK_BASE}/cover` },
  { label: "Execution Rules", href: `${TECHPACK_BASE}/execution-rules` },
  { label: "Brand Intent", href: `${TECHPACK_BASE}/brand-intent` },
  { label: "Collection Overview", href: `${TECHPACK_BASE}/collection-overview` },
]

const appendices = [
  { label: "Appendix A — Trims", href: `${TECHPACK_BASE}/appendix-a-trims` },
  { label: "Appendix B — Tees", href: `${TECHPACK_BASE}/appendix-b-measurements/tees` },
  { label: "Appendix B — Fleece", href: `${TECHPACK_BASE}/appendix-b-measurements/fleece` },
  { label: "Appendix B — Swim (Men)", href: `${TECHPACK_BASE}/appendix-b-measurements/swim-men` },
  { label: "Appendix B — Coastal (Women)", href: `${TECHPACK_BASE}/appendix-b-measurements/coastal-women` },
  { label: "Appendix C — Construction", href: `${TECHPACK_BASE}/appendix-c-sku-construction` },
  { label: "Final Lock Points", href: `${TECHPACK_BASE}/final-lock-points` },
]

// ─── Component ──────────────────────────────────────────────────────

export function TechPackSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-gray-200 overflow-y-auto bg-white">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-gray-100">
        <p className="text-[10px] tracking-[0.12em] text-gray-400 uppercase">
          Satuit Supply Co.
        </p>
        <p className="text-[13px] tracking-wide text-gray-900 mt-1">
          {packMeta.title}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">{packMeta.version}</p>

        <button
          onClick={() => window.print()}
          className="mt-3 flex items-center gap-2 px-2.5 py-1.5 text-[10px] tracking-wide text-gray-500 border border-gray-200 rounded hover:border-gray-300 hover:text-gray-700 transition-colors w-full justify-center"
        >
          <PrinterIcon className="size-3" />
          Print Packet
        </button>
      </div>

      <nav className="px-3 py-4 flex-1">
        {/* Front Matter */}
        <div className="mb-4">
          <ol className="flex flex-col gap-0.5">
            {frontMatter.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-2 py-1.5 rounded text-xs transition-colors",
                    isActive(item.href)
                      ? "text-gray-900 font-medium bg-gray-100"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ol>
        </div>

        <hr className="border-gray-100 mb-4" />

        {/* SKU Groups */}
        {skuGroups.map((group) => (
          <div key={group.id} className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-2">
              {group.title.replace(/^\d+\s\u2014\s/, "")}
            </p>
            <ol className="flex flex-col gap-0.5">
              {group.skus.map((sku) => {
                const href = `${TECHPACK_BASE}/${sku.collectionSlug}/${sku.slug}`
                return (
                  <li key={sku.slug}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center px-2 py-1.5 rounded text-xs transition-colors",
                        isActive(href)
                          ? "text-gray-900 font-medium bg-gray-100"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      {sku.skuName}
                    </Link>
                  </li>
                )
              })}
            </ol>
          </div>
        ))}

        <hr className="border-gray-100 mb-4" />

        {/* Appendices */}
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-2">
            Appendices
          </p>
          <ol className="flex flex-col gap-0.5">
            {appendices.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-2 py-1.5 rounded text-xs transition-colors",
                    isActive(item.href)
                      ? "text-gray-900 font-medium bg-gray-100"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </aside>
  )
}
