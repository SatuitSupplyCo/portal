import { TooltipProvider } from "@repo/ui/tooltip"
import { ShellProvider } from "@/components/shell/ShellProvider"
import { IconRail } from "@/components/shell/IconRail"
import { TopBar } from "@/components/shell/TopBar"
import { RightRail } from "@/components/shell/RightRail"
import { MobileTabBar } from "@/components/shell/MobileTabBar"

export default function VendorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <ShellProvider>
        <div className="flex h-screen overflow-hidden">
          <IconRail surface="vendors" />

          <div className="flex-1 flex flex-col min-w-0">
            <TopBar />

            <div className="flex-1 flex overflow-hidden pb-14 md:pb-0">
              <div className="flex-1 flex min-w-0">{children}</div>
              <RightRail />
            </div>
          </div>
        </div>

        <MobileTabBar surface="vendors" />
      </ShellProvider>
    </TooltipProvider>
  )
}
