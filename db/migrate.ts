/**
 * Migrations-Runner. Rohes SQL, kein ORM.
 *
 * Jede Migration ist eine .sql-Datei in db/migrations, benannt nach dem
 * Schema  NNNN_beschreibung.sql  (fuehrende Nullen, damit sie sortiert).
 * Der Runner faehrt alle noch nicht angewandten Dateien der Reihe nach, jede
 * in einer eigenen Transaktion. Schlaegt eine fehl, wird sie zurueckgerollt
 * und der Lauf bricht ab, ohne die folgenden anzufassen.
 *
 * Aufruf:  npm run migrate
 */
import "./load-env";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "pg";

const MIGRATIONS_DIR = join(process.cwd(), "db", "migrations");

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL fehlt (siehe .env.example)");
  }

  const pool = new Pool({ connectionString });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const applied = new Set(
    (
      await pool.query<{ version: string }>(
        "SELECT version FROM schema_migrations",
      )
    ).rows.map((r) => r.version),
  );

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  let ran = 0;
  for (const file of files) {
    const version = file.replace(/\.sql$/, "");
    if (applied.has(version)) continue;

    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations (version) VALUES ($1)",
        [version],
      );
      await client.query("COMMIT");
      console.log(`  angewandt: ${version}`);
      ran++;
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`  fehlgeschlagen: ${version} (zurueckgerollt)`);
      throw err;
    } finally {
      client.release();
    }
  }

  await pool.end();
  console.log(
    ran === 0 ? "Schema ist aktuell, nichts zu tun." : `${ran} Migration(en) angewandt.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
