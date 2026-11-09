import { PGlite } from "@electric-sql/pglite";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Database client.
 *
 * - Production: set DATABASE_URL (Neon/Supabase/Railway Postgres).
 * - Development: falls back to an embedded PGlite database persisted in ./.pglite.
 *
 * Both drivers expose the same Drizzle query API. Creation is deferred until
 * the first actual query so importing this module (e.g. during builds or in
 * pages that never touch the database) does not spin up a driver.
 */
function createDb(): NodePgDatabase<typeof schema> {
  if (process.env.DATABASE_URL) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    return drizzleNode(pool, { schema });
  }
  const client = new PGlite(process.env.PGLITE_DIR ?? "./.pglite");
  return drizzlePglite(client, { schema }) as unknown as NodePgDatabase<typeof schema>;
}

const globalForDb = globalThis as unknown as { __paicv3Db?: NodePgDatabase<typeof schema> };

function instance(): NodePgDatabase<typeof schema> {
  if (!globalForDb.__paicv3Db) {
    globalForDb.__paicv3Db = createDb();
  }
  return globalForDb.__paicv3Db;
}

export const db: NodePgDatabase<typeof schema> = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop) {
    const target = instance();
    const value = Reflect.get(target, prop);
    return typeof value === "function" ? value.bind(target) : value;
  },
});
