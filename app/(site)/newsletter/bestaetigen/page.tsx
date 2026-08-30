import type { Metadata } from "next";
import Link from "next/link";
import { pool } from "@/db/pool";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Anmeldung bestätigen",
  robots: { index: false },
};

export default async function BestaetigenSeite({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  let bestaetigt = false;

  if (token && /^[a-f0-9]{48}$/.test(token)) {
    const res = await pool.query(
      `UPDATE newsletter_subscribers
          SET confirmed_at = now()
        WHERE token = $1 AND confirmed_at IS NULL`,
      [token],
    );
    if (res.rowCount && res.rowCount > 0) {
      bestaetigt = true;
    } else {
      const schon = await pool.query(
        "SELECT 1 FROM newsletter_subscribers WHERE token = $1 AND confirmed_at IS NOT NULL",
        [token],
      );
      bestaetigt = Boolean(schon.rowCount);
    }
  }

  return (
    <section>
      <div className="wrap legal">
        {bestaetigt ? (
          <>
            <h1>Anmeldung bestätigt</h1>
            <p>Du bekommst ab jetzt den Guide der Woche. Bis bald.</p>
          </>
        ) : (
          <>
            <h1>Link ungültig</h1>
            <p>
              Der Bestätigungslink ist abgelaufen oder falsch. Trag dich einfach
              noch einmal ein.
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
