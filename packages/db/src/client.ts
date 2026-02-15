import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// For query execution — single connection for serverless, pool for long-running
const client = postgres(connectionString);

export const db = drizzle(client, { schema });

export type Database = typeof db;
