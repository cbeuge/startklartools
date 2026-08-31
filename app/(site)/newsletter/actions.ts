"use server";

import { randomBytes } from "node:crypto";
import { pool } from "@/db/pool";
import { sendeMail } from "@/lib/mail";

export type NewsletterState = { ok?: boolean; error?: string };

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function newsletterEintragen(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 200) {
    return { error: "Bitte eine gültige E-Mail-Adresse." };
  }

  const token = randomBytes(24).toString("hex");

  // Neue Adresse anlegen, oder eine noch nicht bestätigte bzw. abgemeldete
  // reaktivieren – dann aber immer wieder über Double-Opt-in. Eine aktive,
  // bestätigte Adresse bleibt unangetastet. last_mail_at drosselt auf eine
  // Bestätigungsmail pro Adresse alle 10 Minuten.
  const res = await pool.query<{ token: string }>(
    `INSERT INTO newsletter_subscribers (email, token, last_mail_at)
     VALUES ($1, $2, now())
     ON CONFLICT (email) DO UPDATE
       SET token = EXCLUDED.token,
           confirmed_at = NULL,
           unsubscribed_at = NULL,
           last_mail_at = now()
     WHERE (newsletter_subscribers.confirmed_at IS NULL
            OR newsletter_subscribers.unsubscribed_at IS NOT NULL)
       AND (newsletter_subscribers.last_mail_at IS NULL
            OR newsletter_subscribers.last_mail_at < now() - interval '10 minutes')
     RETURNING token`,
    [email, token],
  );

  const row = res.rows[0];
  if (row) {
    const basis = process.env.NEXT_PUBLIC_BASE_URL ?? "";
    const link = `${basis}/newsletter/bestaetigen?token=${row.token}`;
    await sendeMail({
      an: email,
      betreff: "Bitte bestätige deine Anmeldung zum Guide der Woche",
      text:
        `Hallo,\n\nbitte bestätige deine Anmeldung mit einem Klick:\n${link}\n\n` +
        `Wenn du dich nicht angemeldet hast, ignoriere diese E-Mail einfach.\n\n` +
        `startklar.tools`,
    });
  }

  // Immer neutral bestätigen, egal ob neu, schon angemeldet, gedrosselt oder
  // schon bestätigt – sonst verrät die Seite, welche Adressen eingetragen sind.
  return { ok: true };
}
