import "server-only";
import { query, queryOne } from "@/db/pool";

export type NewsletterZahlen = {
  bestaetigt: number;
  ausstehend: number;
  abgemeldet: number;
};

export async function newsletterZahlen(): Promise<NewsletterZahlen> {
  const row = await queryOne<NewsletterZahlen>(`
    SELECT
      count(*) FILTER (
        WHERE confirmed_at IS NOT NULL AND unsubscribed_at IS NULL
      )::int AS bestaetigt,
      count(*) FILTER (
        WHERE confirmed_at IS NULL AND unsubscribed_at IS NULL
      )::int AS ausstehend,
      count(*) FILTER (WHERE unsubscribed_at IS NOT NULL)::int AS abgemeldet
    FROM newsletter_subscribers
  `);
  return row ?? { bestaetigt: 0, ausstehend: 0, abgemeldet: 0 };
}

// Aktive Empfänger mit ihrem Token für den persönlichen Abmeldelink.
export function aktiveEmpfaenger(): Promise<{ email: string; token: string }[]> {
  return query<{ email: string; token: string }>(`
    SELECT email, token
      FROM newsletter_subscribers
     WHERE confirmed_at IS NOT NULL AND unsubscribed_at IS NULL
     ORDER BY confirmed_at
  `);
}

export type Kampagne = {
  id: number;
  betreff: string;
  empfaenger: number;
  fehlgeschlagen: number;
  gesendet_am: string;
};

export function kampagnenListe(limit = 20): Promise<Kampagne[]> {
  return query<Kampagne>(
    `SELECT id, betreff, empfaenger, fehlgeschlagen, gesendet_am
       FROM newsletter_campaigns
      ORDER BY gesendet_am DESC
      LIMIT $1`,
    [limit],
  );
}
