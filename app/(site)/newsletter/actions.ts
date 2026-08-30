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

  // Neue Adresse anlegen oder – solange noch nicht bestätigt – den Token
  // erneuern. Eine bereits bestätigte Adresse bleibt unangetastet.
  const res = await pool.query<{ token: string; confirmed_at: string | null }>(
    `INSERT INTO newsletter_subscribers (email, token)
     VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE
       SET token = EXCLUDED.token, unsubscribed_at = NULL
     WHERE newsletter_subscribers.confirmed_at IS NULL
     RETURNING token, confirmed_at`,
    [email, token],
  );

  const row = res.rows[0];
  if (row && !row.confirmed_at) {
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

  // Immer neutral bestätigen, egal ob neu, schon angemeldet oder schon
  // bestätigt – sonst verrät die Seite, welche Adressen eingetragen sind.
  return { ok: true };
}
