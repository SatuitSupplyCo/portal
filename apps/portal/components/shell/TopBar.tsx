"use client"

import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Separator } from "@repo/ui/separator"
import { Button } from "@repo/ui/button"
import { Breadcrumbs } from "./Breadcrumbs"
import { useShell } from "./ShellProvider"

const sectionPrefixes = [
  "/internal/brand",
  "/internal/studio",
  "/internal/product",
  "/internal/sourcing",
  "/admin",
]

export function TopBar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const { actions, setSectionNavOpen } = useShell()

  const hasSectionNav = sectionPrefixes.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  )

  return (
    <header className="flex h-14 items-center gap-3 border-b px-4 shrink-0">
      {/* Mobile hamburger — only when a section sidebar exists */}
      {hasSectionNav && (
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden h-8 w-8 p-0"
          onClick={() => setSectionNavOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open section menu</span>
        </Button>
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Contextual actions from the current page */}
      {actions && (
        <>
          <div className="flex items-center gap-1">{actions}</div>
          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* User menu */}
      {session?.user && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {session.user.name ?? session.user.email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          >
            Sign out
          </Button>
        </div>
      )}
    </header>
  )
}
