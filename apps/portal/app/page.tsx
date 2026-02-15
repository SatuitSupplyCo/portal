import { redirect } from "next/navigation"
import { auth } from "@repo/auth"

/**
 * Root route — redirects to the appropriate surface based on user role.
 */
export default async function RootPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  switch (session.user.role) {
    case "partner_viewer":
      redirect("/partners")
    case "vendor_viewer":
      redirect("/vendors")
    default:
      // owner, admin, editor, internal_viewer → internal surface
      redirect("/internal")
  }
}
