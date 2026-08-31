"use server";

import { revalidatePath } from "next/cache";
import { pool } from "@/db/pool";
import { requireAdmin } from "@/lib/auth";
import { renderMarkdown } from "@/lib/markdown";
import {
  mailKonfiguriert,
  sendeMail,
  signaturHtml,
  signaturText,
} from "@/lib/mail";
import { aktiveEmpfaenger } from "@/lib/newsletter";

export type VersandState = {
  fehler?: string;
  ergebnis?: { gesendet: number; fehlgeschlagen: number };
};

// Sicherheitsnetz: mehr Empfänger auf einmal würde die Server-Aktion zu lange
// blockieren und läuft schnell in die Sendegrenzen des Postfachs. Wächst die
// Liste darüber hinaus, muss der Versand in Etappen laufen (dann hier anfassen).
const MAX_EMPFAENGER = 500;

export async function vorschau(md: string): Promise<string> {
  await requireAdmin();
  return renderMarkdown(md);
}

function mailHuelle(innerHtml: string, abmeldeUrl: string): string {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1e2a25;max-width:600px;margin:0 auto;padding:8px">
${innerHtml}
<hr style="border:none;border-top:1px solid #d7d2c4;margin:32px 0 16px">
<p style="font-size:13px;color:#5b655f;margin:0">
Du bekommst diese E-Mail, weil du dich auf startklar.tools für den Guide der Woche angemeldet hast.<br>
<a href="${abmeldeUrl}" style="color:#8e2c22">Vom Newsletter abmelden</a>
</p>
${signaturHtml()}
</div>`;
}

// Relative Links (/ratgeber/…, /go/…) im gerenderten Markdown auf die volle
// Domain bringen – in einer E-Mail lässt sich "/…" nicht auflösen.
function linksAbsolut(html: string, basis: string): string {
  return basis
    ? html.replace(/(href|src)="\/(?!\/)/g, `$1="${basis}/`)
    : html;
}

export async function newsletterSenden(
  _prev: VersandState,
  formData: FormData,
): Promise<VersandState> {
  await requireAdmin();

  const betreff = String(formData.get("betreff") ?? "").trim();
  const inhalt = String(formData.get("inhalt") ?? "").trim();

  if (!betreff) return { fehler: "Betreff fehlt." };
  if (inhalt.length < 20) return { fehler: "Der Text ist zu kurz." };
  if (!mailKonfiguriert()) {
    return {
      fehler:
        "SMTP ist nicht konfiguriert (SMTP_HOST/USER/PASS in der .env auf dem Server).",
    };
  }

  const empfaenger = await aktiveEmpfaenger();
  if (empfaenger.length === 0) {
    return { fehler: "Es gibt noch keine bestätigten Empfänger." };
  }
  if (empfaenger.length > MAX_EMPFAENGER) {
    return {
      fehler: `Zu viele Empfänger auf einmal (${empfaenger.length}, Grenze ${MAX_EMPFAENGER}).`,
    };
  }

  const basis = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/+$/, "");
  const inhaltHtml = linksAbsolut(renderMarkdown(inhalt), basis);

  let gesendet = 0;
  let fehlgeschlagen = 0;
  for (const e of empfaenger) {
    const abmeldeUrl = `${basis}/newsletter/abmelden?token=${e.token}`;
    try {
      const ok = await sendeMail({
        an: e.email,
        betreff,
        text:
          `${inhalt}\n\n---\n` +
          `Du bekommst diese E-Mail, weil du dich auf startklar.tools für den ` +
          `Guide der Woche angemeldet hast.\n` +
          `Vom Newsletter abmelden: ${abmeldeUrl}\n\n` +
          signaturText(),
        html: mailHuelle(inhaltHtml, abmeldeUrl),
      });
      if (ok) gesendet++;
      else fehlgeschlagen++;
    } catch (err) {
      console.error("Newsletter-Versand fehlgeschlagen an", e.email, err);
      fehlgeschlagen++;
    }
  }

  await pool.query(
    `INSERT INTO newsletter_campaigns (betreff, inhalt_md, empfaenger, fehlgeschlagen)
     VALUES ($1, $2, $3, $4)`,
    [betreff, inhalt, gesendet, fehlgeschlagen],
  );

  revalidatePath("/admin/newsletter");
  return { ergebnis: { gesendet, fehlgeschlagen } };
}
