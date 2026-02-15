import { Montserrat } from "next/font/google"
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

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${montserrat.variable} flex flex-1 min-w-0 min-h-0`}>
      <ProductSidebar />
      {children}
    </div>
  )
}
