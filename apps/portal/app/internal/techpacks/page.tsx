import { redirect } from "next/navigation"
import { TECHPACK_BASE } from "@/lib/content/launch-v1"

export default function TechPacksPage() {
  redirect(`${TECHPACK_BASE}/cover`)
}
