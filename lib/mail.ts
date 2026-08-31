import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

const HOST = process.env.SMTP_HOST;
const PORT = Number(process.env.SMTP_PORT ?? 587);
const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASS;

export const MAIL_FROM =
  process.env.MAIL_FROM ?? "startklar.tools <noreply@startklar.tools>";

// Pflichtangaben für die Signatur unter jeder Mail. Gleiche Daten wie im
// Impressum (LegalHub, Slug startklartools) – ändert sich praktisch nie.
export const ANBIETER = {
  name: "Carsten Beuge",
  strasse: "Langeneßallee 26",
  ort: "23554 Lübeck",
  email: "info@startklar.tools",
};

export function signaturText(): string {
  return [
    "--",
    "startklar.tools",
    `${ANBIETER.name}, ${ANBIETER.strasse}, ${ANBIETER.ort}`,
    ANBIETER.email,
    `Inhaltlich verantwortlich (§ 18 Abs. 2 MStV): ${ANBIETER.name}, Anschrift wie oben`,
  ].join("\n");
}

export function signaturHtml(): string {
  return `<p style="font-size:12px;color:#5b655f;line-height:1.5;margin:16px 0 0">
startklar.tools<br>
${ANBIETER.name}, ${ANBIETER.strasse}, ${ANBIETER.ort}<br>
<a href="mailto:${ANBIETER.email}" style="color:#5b655f">${ANBIETER.email}</a><br>
Inhaltlich verantwortlich (§ 18 Abs. 2 MStV): ${ANBIETER.name}, Anschrift wie oben
</p>`;
}

export function mailKonfiguriert(): boolean {
  return Boolean(HOST && USER && PASS);
}

let transport: Transporter | null = null;
function getTransport(): Transporter {
  if (!transport) {
    transport = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: PORT === 465,
      auth: { user: USER, pass: PASS },
    });
  }
  return transport;
}

export async function sendeMail(opts: {
  an: string;
  betreff: string;
  text: string;
  html?: string;
}): Promise<boolean> {
  if (!mailKonfiguriert()) {
    console.warn(
      `[mail] SMTP nicht konfiguriert – „${opts.betreff}“ an ${opts.an} nicht gesendet`,
    );
    return false;
  }
  await getTransport().sendMail({
    from: MAIL_FROM,
    to: opts.an,
    subject: opts.betreff,
    text: opts.text,
    html: opts.html,
  });
  return true;
}
