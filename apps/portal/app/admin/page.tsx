import { auth } from "@repo/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { SetBreadcrumbs } from "@/components/nav/SetBreadcrumbs"

const sections = [
  {
    title: "Users",
    description: "Manage portal users and roles",
    href: "/admin/users",
  },
  {
    title: "Organizations",
    description: "Vendor and partner companies",
    href: "/admin/orgs",
  },
  {
    title: "Audit Log",
    description: "Publishing and approval history",
    href: "/admin/audit",
  },
]

export default async function AdminDashboard() {
  const session = await auth()
  if (!session) redirect("/auth/signin")

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <SetBreadcrumbs crumbs={[{ label: "Admin" }]} />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
          <p className="text-muted-foreground">
            Manage users, organizations, and system settings.
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
