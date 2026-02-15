import { TooltipProvider } from "@repo/ui/tooltip"
import { ShellProvider } from "@/components/shell/ShellProvider"
import { IconRail } from "@/components/shell/IconRail"
import { TopBar } from "@/components/shell/TopBar"
import { RightRail } from "@/components/shell/RightRail"
import { MobileNavDrawer } from "@/components/shell/MobileNavDrawer"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <ShellProvider>
        <div className="flex h-screen overflow-hidden">
          <IconRail surface="admin" />

          <div className="flex-1 flex flex-col min-w-0">
            <TopBar />

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex min-w-0">{children}</div>
              <RightRail />
            </div>
          </div>
        </div>

        <MobileNavDrawer surface="admin" />
      </ShellProvider>
    </TooltipProvider>
  )
}
