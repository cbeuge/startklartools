import type { Metadata } from "next";
import Link from "next/link";
import { pool } from "@/db/pool";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Newsletter abbestellen",
  robots: { index: false },
};

export default async function AbmeldenSeite({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  let abgemeldet = false;

  if (token && /^[a-f0-9]{48}$/.test(token)) {
    const res = await pool.query(
      `UPDATE newsletter_subscribers
          SET unsubscribed_at = now()
        WHERE token = $1 AND unsubscribed_at IS NULL`,
      [token],
    );
    if (res.rowCount && res.rowCount > 0) {
      abgemeldet = true;
    } else {
      // War schon abgemeldet? Dann trotzdem als Erfolg zeigen.
      const schon = await pool.query(
        "SELECT 1 FROM newsletter_subscribers WHERE token = $1 AND unsubscribed_at IS NOT NULL",
        [token],
      );
      abgemeldet = Boolean(schon.rowCount);
    }
  }

  return (
    <section>
      <div className="wrap legal">
        {abgemeldet ? (
          <>
            <h1>Abgemeldet</h1>
            <p>
              Du bekommst den Guide der Woche ab jetzt nicht mehr. Falls du es
              dir anders überlegst, kannst du dich jederzeit wieder eintragen.
            </p>
          </>
        ) : (
          <>
            <h1>Link ungültig</h1>
            <p>
              Der Abmeldelink ist falsch oder unvollständig. Schreib uns kurz,
              dann nehmen wir dich von Hand aus dem Verteiler.
            </p>
          </>
        )}
        <p style={{ marginTop: 24 }}>
          <Link
            href="/"
            style={{
              color: "var(--stamp-dark)",
              borderBottom: "1px solid var(--stamp)",
            }}
          >
            Zur Startseite
          </Link>
        </p>
      </div>
    </section>
  );
}
