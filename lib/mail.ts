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

// Gmail, Apple Mail & Co. verlinken erkannte Postanschriften automatisch auf
// Karten-Dienste. Ein unsichtbares Zero-Width-Space in Hausnummer und PLZ
// bricht die Mustererkennung, ohne dass man etwas sieht.
const ZWS = "​";
function anschrift(): string {
  const strasse = ANBIETER.strasse.replace(" ", `${ZWS} `);
  const ort = ANBIETER.ort.replace(/^(\d)(\d)/, `$1${ZWS}$2`);
  return `${ANBIETER.name}, ${strasse}, ${ort}`;
}

export function signaturText(): string {
  return [
    "--",
    "startklar.tools",
    anschrift(),
    ANBIETER.email,
    `Inhaltlich verantwortlich (§ 18 Abs. 2 MStV): ${ANBIETER.name}, Anschrift wie oben`,
  ].join("\n");
}

export function signaturHtml(): string {
  return `<p style="font-size:12px;color:#5b655f;line-height:1.5;margin:16px 0 0">
startklar.tools<br>
${anschrift()}<br>
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
