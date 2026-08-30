import "server-only";
import { Pool, type QueryResultRow } from "pg";

// Eine Pool-Instanz pro Prozess. Im Dev-Modus haelt Next die Module ueber
// Hot-Reload hinweg, deshalb an globalThis haengen, sonst haeuft sich pro
// Reload ein neuer Pool an.
const store = globalThis as unknown as { _pgPool?: Pool };

export const pool =
  store._pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") store._pgPool = pool;

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const res = await pool.query<T>(text, params as unknown[]);
  return res.rows;
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
