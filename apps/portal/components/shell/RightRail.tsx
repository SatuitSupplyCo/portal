"use client"

import { X } from "lucide-react"
import { Button } from "@repo/ui/button"
import { useShell } from "./ShellProvider"

export function RightRail() {
  const { rightRailOpen, setRightRailOpen, rightRailContent } = useShell()

  return (
    <aside
      className={
        "shrink-0 border-l bg-muted/10 overflow-y-auto transition-[width] duration-200 ease-in-out " +
        (rightRailOpen ? "w-[400px]" : "w-0 border-l-0")
      }
    >
      {rightRailOpen && (
        <div className="w-[400px]">
          <div className="flex items-center justify-between border-b pl-4 pr-8 py-3">
            <span className="text-sm font-semibold">Details</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setRightRailOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close panel</span>
            </Button>
          </div>
          <div className="pl-4 pr-8 py-4">{rightRailContent}</div>
        </div>
      )}
    </aside>
  )
}
