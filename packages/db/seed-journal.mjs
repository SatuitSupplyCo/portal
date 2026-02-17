import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

const migrations = [
  { hash: "f486041336505f387e540f87569c376c8d8e82ba6b2549127f55ae2dcc9a9358", created_at: 1771214215324 },
  { hash: "ddf3b06ea8bd80b8b0869ec1fff2bab85a99a41b546896b7d3d31ea84ee1b4ae", created_at: 1771217817745 },
  { hash: "5e9cea4ae732f0c239fb8da59e63a5fa9226d1bca735b7f6f55229feaba6bc36", created_at: 1771218176381 },
  { hash: "b3bc51ad31f0e8c4e825091b9307093ff30a4d63dc01f6acd4564d2e50b7ba71", created_at: 1771218435253 },
  { hash: "5d765bf5b5c48790c76c5ca22cd353a4b33c7358a78a125b44a8e73cc248d6a8", created_at: 1771220693424 },
  { hash: "36c3250fdd530a603236b6308d5745a5adbe1f238443c9720268bdbdcb7bbe76", created_at: 1771244692000 },
];

try {
  // Use season_slots as the definitive check — it's the last major table
  // created in migration 0000, so if it exists the full schema is there.
  const [{ exists: schemaComplete }] = await sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'season_slots'
    )
  `;

  if (schemaComplete) {
    // Full schema exists (from push or prior migrations) — seed the journal
    // so drizzle only runs new migrations (0006+).
    console.log("Schema is complete — seeding journal for migrations 0000-0005.");
    await sql`CREATE SCHEMA IF NOT EXISTS "drizzle"`;
    await sql`
      CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `;

    const existing = await sql`SELECT hash FROM "drizzle"."__drizzle_migrations"`;
    const existingHashes = new Set(existing.map((r) => r.hash));

    for (const m of migrations) {
      if (!existingHashes.has(m.hash)) {
        await sql`INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at) VALUES (${m.hash}, ${m.created_at})`;
        console.log(`Seeded migration: ${m.hash.slice(0, 16)}...`);
      }
    }
    console.log("Journal seed complete.");
  } else {
    // Schema is incomplete or missing — nuke partial state and start fresh.
    // Safe because this is initial setup with no production data.
    console.log("Schema incomplete — dropping partial state for clean migration run.");

    // Drop all tables in public schema (handles partial table state)
    const tables = await sql`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;
    for (const { tablename } of tables) {
      await sql.unsafe(`DROP TABLE IF EXISTS "public"."${tablename}" CASCADE`);
      console.log(`Dropped table: ${tablename}`);
    }

    // Drop all enum types in public schema (handles orphaned types)
    const types = await sql`
      SELECT typname FROM pg_type
      WHERE typnamespace = 'public'::regnamespace AND typtype = 'e'
    `;
    for (const { typname } of types) {
      await sql.unsafe(`DROP TYPE IF EXISTS "public"."${typname}" CASCADE`);
      console.log(`Dropped type: ${typname}`);
    }

    // Drop the drizzle journal (removes bad seed entries)
    await sql`DROP SCHEMA IF EXISTS "drizzle" CASCADE`;

    console.log("Clean slate ready — all migrations will run from scratch.");
  }
} catch (err) {
  console.error("Pre-migration failed:", err);
  process.exit(1);
} finally {
  await sql.end();
}
