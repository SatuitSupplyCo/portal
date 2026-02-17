/**
 * One-time bootstrap endpoint.
 *
 * Promotes matt@satuitsupply.com to owner and seeds the product taxonomy.
 * Safe to run multiple times (idempotent). Remove this route after use.
 *
 * Usage: POST /api/bootstrap
 */
import { NextResponse } from "next/server"
import { db } from "@repo/db/client"
import { users } from "@repo/db/schema"
import { eq } from "@repo/db"
import {
  seedSeasons,
  seedCorePrograms,
  seedProductTaxonomy,
} from "@repo/db/seed"

export async function POST() {
  const results: string[] = []

  // 1. Promote user to owner
  const [promoted] = await db
    .update(users)
    .set({ role: "owner" })
    .where(eq(users.email, "matt@satuitsupply.com"))
    .returning({ email: users.email, role: users.role })

  if (promoted) {
    results.push(`Promoted ${promoted.email} to ${promoted.role}`)
  } else {
    results.push("No user found with that email — skipped promotion")
  }

  // 2. Seed product data (all functions are idempotent)
  await seedSeasons()
  results.push("Seasons seeded")

  await seedCorePrograms()
  results.push("Core programs seeded")

  await seedProductTaxonomy()
  results.push("Product taxonomy seeded")

  return NextResponse.json({ results })
}
