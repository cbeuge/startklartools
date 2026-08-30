import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

const HOST = process.env.SMTP_HOST;
const PORT = Number(process.env.SMTP_PORT ?? 587);
const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASS;

export const MAIL_FROM =
  process.env.MAIL_FROM ?? "startklar.tools <noreply@startklar.tools>";

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
