/**
 * Promote a user to "owner" role by email address.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." pnpm promote-owner your@email.com
 */
import { db } from "./client"
import { users } from "./schema"
import { eq } from "drizzle-orm"

const email = process.argv[2]

if (!email) {
  console.error("Usage: pnpm promote-owner <email>")
  process.exit(1)
}

async function main() {
  const user = await db.query.users.findFirst({
    where: (u, { eq: e }) => e(u.email, email),
  })

  if (!user) {
    console.error(`No user found with email: ${email}`)
    process.exit(1)
  }

  if (user.role === "owner") {
    console.log(`${email} is already an owner.`)
    process.exit(0)
  }

  await db
    .update(users)
    .set({ role: "owner" })
    .where(eq(users.id, user.id))

  console.log(`Promoted ${email} from "${user.role}" to "owner".`)
  process.exit(0)
}

main().catch((err) => {
  console.error("Failed:", err)
  process.exit(1)
})
