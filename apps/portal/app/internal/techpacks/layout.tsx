import { TechPackSidebar } from "@/components/techpacks/TechPackSidebar"
import { LaunchV1Packet } from "@/components/techpacks/LaunchV1Packet"
import "./techpacks.css"

export default function TechPacksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Screen layout */}
      <div data-techpack-screen className="flex flex-1 min-w-0 min-h-0">
        <TechPackSidebar />
        <div className="flex-1 overflow-y-auto bg-[#f5f5f5] py-10">
          <div className="max-w-[8.5in] mx-auto">{children}</div>
        </div>
      </div>

      {/* Print packet — hidden on screen, rendered when printing */}
      <div className="hidden" data-techpack-print>
        <LaunchV1Packet />
      </div>
    </>
  )
}
