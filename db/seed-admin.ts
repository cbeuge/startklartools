/**
 * Legt den Admin-Nutzer an oder setzt sein Passwort neu.
 * Liest ADMIN_EMAIL und ADMIN_PASSWORD aus der Umgebung, damit kein Hash im
 * Code oder in einer Migration landet.
 *
 * Aufruf:  npm run seed:admin
 */
import "./load-env";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

async function main() {
  const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!DATABASE_URL) throw new Error("DATABASE_URL fehlt");
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL und ADMIN_PASSWORD muessen gesetzt sein");
  }
  if (ADMIN_PASSWORD.length < 12) {
    throw new Error("ADMIN_PASSWORD ist zu kurz (mindestens 12 Zeichen)");
  }

  const pool = new Pool({ connectionString: DATABASE_URL });
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  // Passwortwechsel zaehlt session_version hoch, damit alte Sitzungen fallen.
  await pool.query(
    `INSERT INTO admin_users (email, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE
       SET password_hash   = EXCLUDED.password_hash,
           session_version = admin_users.session_version + 1`,
    [ADMIN_EMAIL.toLowerCase(), hash],
  );

  await pool.end();
  console.log(`Admin gesetzt: ${ADMIN_EMAIL.toLowerCase()}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
