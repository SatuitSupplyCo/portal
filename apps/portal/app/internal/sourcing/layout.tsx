import { SourcingSidebar } from "@/components/sourcing/SourcingSidebar"

export default function SourcingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SourcingSidebar />
      {children}
    </>
  )
}
