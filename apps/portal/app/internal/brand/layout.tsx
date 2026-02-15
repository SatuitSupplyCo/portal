import { BrandSidebar } from "@/components/brand/BrandSidebar"

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <BrandSidebar />
      {children}
    </>
  )
}
