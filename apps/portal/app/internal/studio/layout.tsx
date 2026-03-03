import { StudioSidebar } from "@/components/studio/StudioSidebar"

const CONCEPTING_ENABLED = process.env.STUDIO_CONCEPTING_ENABLED === "true"
const DESIGN_ENABLED = process.env.STUDIO_DESIGN_ENABLED !== "false"

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <StudioSidebar
        conceptingEnabled={CONCEPTING_ENABLED}
        designEnabled={DESIGN_ENABLED}
      />
      {children}
    </>
  )
}
