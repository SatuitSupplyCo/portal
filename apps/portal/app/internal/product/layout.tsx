import { Montserrat } from "next/font/google"
import { db } from "@repo/db/client"
import { ProductSidebar } from "@/components/product/ProductSidebar"
import "./product.css"

// ─── Font ────────────────────────────────────────────────────────────

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-montserrat",
})

// ─── Layout ──────────────────────────────────────────────────────────

export default async function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const collections = await db.query.collections.findMany({
    columns: { code: true, name: true },
    where: (c, { eq }) => eq(c.status, "active"),
    orderBy: (c, { asc }) => [asc(c.sortOrder)],
  })

  return (
    <div className={`${montserrat.variable} flex flex-1 min-w-0 min-h-0`}>
      <ProductSidebar collections={collections} />
      {children}
    </div>
  )
}
