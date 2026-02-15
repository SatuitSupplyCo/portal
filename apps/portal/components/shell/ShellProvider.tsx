"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

// ─── Types ───────────────────────────────────────────────────────────

export interface Crumb {
  label: string
  href?: string
}

interface ShellContextValue {
  // Breadcrumbs
  breadcrumbs: Crumb[]
  setBreadcrumbs: (crumbs: Crumb[]) => void

  // Action bar (right side of top bar)
  actions: ReactNode
  setActions: (node: ReactNode) => void

  // Right rail
  rightRailOpen: boolean
  setRightRailOpen: (open: boolean) => void
  rightRailContent: ReactNode
  setRightRailContent: (node: ReactNode) => void

  // Mobile nav drawer
  mobileNavOpen: boolean
  setMobileNavOpen: (open: boolean) => void
}

const ShellContext = createContext<ShellContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────

export function ShellProvider({ children }: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<Crumb[]>([])
  const [actions, setActions] = useState<ReactNode>(null)
  const [rightRailOpen, setRightRailOpen] = useState(false)
  const [rightRailContent, setRightRailContent] = useState<ReactNode>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <ShellContext.Provider
      value={{
        breadcrumbs,
        setBreadcrumbs,
        actions,
        setActions,
        rightRailOpen,
        setRightRailOpen,
        rightRailContent,
        setRightRailContent,
        mobileNavOpen,
        setMobileNavOpen,
      }}
    >
      {children}
    </ShellContext.Provider>
  )
}

// ─── Hook: raw context ───────────────────────────────────────────────

export function useShell() {
  const ctx = useContext(ShellContext)
  if (!ctx) throw new Error("useShell must be used within a ShellProvider")
  return ctx
}

// ─── Hook: breadcrumbs (auto-cleanup) ────────────────────────────────

export function useShellBreadcrumbs(crumbs: Crumb[]) {
  const { setBreadcrumbs } = useShell()
  const serialized = JSON.stringify(crumbs)

  useEffect(() => {
    setBreadcrumbs(crumbs)
    return () => setBreadcrumbs([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized, setBreadcrumbs])
}

// ─── Hook: actions (auto-cleanup) ────────────────────────────────────

export function useShellActions(node: ReactNode) {
  const { setActions } = useShell()
  const nodeRef = useRef(node)
  nodeRef.current = node

  useEffect(() => {
    setActions(nodeRef.current)
    return () => setActions(null)
  }, [setActions])
}

// ─── Hook: right rail (auto-cleanup) ─────────────────────────────────

export function useRightRail(content: ReactNode) {
  const { setRightRailContent, setRightRailOpen } = useShell()
  const contentRef = useRef(content)
  contentRef.current = content

  useEffect(() => {
    setRightRailContent(contentRef.current)
    return () => {
      setRightRailContent(null)
      setRightRailOpen(false)
    }
  }, [setRightRailContent, setRightRailOpen])
}
