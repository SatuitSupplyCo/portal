/**
 * Seed script entry point.
 *
 * Usage: pnpm db:seed  (with DATABASE_URL in env)
 */
import { seed } from "./seed"

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err)
    process.exit(1)
  })
