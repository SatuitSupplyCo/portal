import { TooltipProvider } from "@repo/ui/tooltip"
import { ShellProvider } from "@/components/shell/ShellProvider"
import { IconRail } from "@/components/shell/IconRail"
import { TopBar } from "@/components/shell/TopBar"
import { RightRail } from "@/components/shell/RightRail"
import { MobileNavDrawer } from "@/components/shell/MobileNavDrawer"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <ShellProvider>
        <div className="flex h-screen overflow-hidden">
          <IconRail surface="internal" />

          <div className="flex-1 flex flex-col min-w-0">
            <TopBar />

            <div className="flex-1 flex overflow-hidden">
              <AdminSidebar />
              <div className="flex-1 flex min-w-0">{children}</div>
              <RightRail />
            </div>
          </div>
        </div>

        <MobileNavDrawer surface="internal" />
      </ShellProvider>
    </TooltipProvider>
  )
}
