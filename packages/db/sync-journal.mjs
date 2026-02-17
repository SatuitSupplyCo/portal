import { createHash } from "crypto";
import { readFileSync } from "fs";
import postgres from "postgres";

// One-time script to transition the drizzle migration journal from
// the old 7-file layout (0000-0006) to the squashed single baseline.
// Safe to run repeatedly — it's a no-op once the baseline hash is present.

const sql = postgres(process.env.DATABASE_URL);

try {
  const content = readFileSync(new URL("./drizzle/0000_baseline.sql", import.meta.url), "utf-8");
  const hash = createHash("sha256").update(content).digest("hex");

  await sql`CREATE SCHEMA IF NOT EXISTS "drizzle"`;
  await sql`
    CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `;

  const [{ exists }] = await sql`
    SELECT EXISTS (
      SELECT 1 FROM "drizzle"."__drizzle_migrations" WHERE hash = ${hash}
    )
  `;

  if (exists) {
    console.log("Journal already has baseline entry. Nothing to do.");
  } else {
    await sql`DELETE FROM "drizzle"."__drizzle_migrations"`;
    await sql`INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at) VALUES (${hash}, ${Date.now()})`;
    console.log(`Replaced journal with baseline hash: ${hash.slice(0, 16)}...`);
  }
} catch (err) {
  console.error("Journal sync failed:", err);
  process.exit(1);
} finally {
  await sql.end();
}
