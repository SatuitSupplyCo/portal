import { auth } from "@repo/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { SetBreadcrumbs } from "@/components/nav/SetBreadcrumbs"

const sections = [
  {
    title: "Documents",
    description: "Guidelines, playbooks, and standards",
    href: "/internal/docs",
  },
  {
    title: "Assets",
    description: "Approved files and versions",
    href: "/internal/assets",
  },
  {
    title: "Tech Packs",
    description: "SKU execution pages",
    href: "/internal/techpacks",
  },
  {
    title: "Packs",
    description: "Bundles, kits, and collections",
    href: "/internal/packs",
  },
  {
    title: "Tests",
    description: "Evidence library",
    href: "/internal/tests",
  },
  {
    title: "Changelog",
    description: "What changed and why",
    href: "/internal/changelog",
  },
]

export default async function InternalDashboard() {
  const session = await auth()
  if (!session) redirect("/auth/signin")

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <SetBreadcrumbs crumbs={[{ label: "Dashboard" }]} />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name ?? "team member"}.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-lg border bg-card p-6 shadow-sm transition-colors hover:bg-accent"
            >
              <h2 className="font-semibold">{section.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {section.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
