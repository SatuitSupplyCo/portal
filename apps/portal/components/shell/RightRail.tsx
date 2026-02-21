"use client"

import { X } from "lucide-react"
import { Button } from "@repo/ui/button"
import { useShell } from "./ShellProvider"

export function RightRail() {
  const { rightRailOpen, setRightRailOpen, rightRailContent } = useShell()

  return (
    <>
      {/* Mobile: full-screen overlay */}
      {rightRailOpen && (
        <aside className="fixed inset-0 z-50 flex flex-col bg-background overflow-y-auto md:hidden">
          <div className="flex items-center justify-between border-b px-4 py-3">
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
          <div className="flex-1 px-4 py-4 overflow-y-auto">{rightRailContent}</div>
        </aside>
      )}

      {/* Desktop: inline sidebar */}
      <aside
        className={
          "hidden md:block shrink-0 border-l bg-muted/10 overflow-y-auto transition-[width] duration-200 ease-in-out " +
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
    </>
  )
}
