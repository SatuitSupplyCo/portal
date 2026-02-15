import { StudioSidebar } from "@/components/studio/StudioSidebar"

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <StudioSidebar />
      {children}
    </>
  )
}
