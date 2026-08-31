import { kampagnenListe, newsletterZahlen } from "@/lib/newsletter";
import { mailKonfiguriert } from "@/lib/mail";
import { NewsletterVersand } from "@/components/admin/NewsletterVersand";

export const dynamic = "force-dynamic";

function datum(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminNewsletter() {
  const [z, kampagnen] = await Promise.all([
    newsletterZahlen(),
    kampagnenListe(),
  ]);
  const smtpOk = mailKonfiguriert();

  const kacheln = [
    { label: "Bestätigt", wert: z.bestaetigt },
    { label: "Ausstehend", wert: z.ausstehend },
    { label: "Abgemeldet", wert: z.abgemeldet },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Newsletter</h1>

      <div className="grid grid-cols-3 gap-4">
        {kacheln.map((k) => (
          <div
            key={k.label}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="text-2xl font-semibold">{k.wert}</div>
            <div className="mt-1 text-xs text-slate-500">{k.label}</div>
          </div>
        ))}
      </div>

      {!smtpOk && (
        <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
          SMTP ist auf dem Server noch nicht konfiguriert. Anmeldungen werden
          gespeichert, aber es geht keine Bestätigungsmail raus und der Versand
          ist deaktiviert. Trag <span className="font-mono">SMTP_HOST</span>,{" "}
          <span className="font-mono">SMTP_USER</span> und{" "}
          <span className="font-mono">SMTP_PASS</span> in die{" "}
          <span className="font-mono">.env</span> ein.
        </p>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Neue Ausgabe</h2>
        <NewsletterVersand empfaenger={z.bestaetigt} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Versendet</h2>
        {kampagnen.length === 0 ? (
          <p className="text-sm text-slate-400">Noch nichts versendet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 font-medium">Datum</th>
                <th className="py-2 font-medium">Betreff</th>
                <th className="py-2 font-medium">Empfänger</th>
              </tr>
            </thead>
            <tbody>
              {kampagnen.map((k) => (
                <tr key={k.id} className="border-b border-slate-100">
                  <td className="py-2 whitespace-nowrap text-slate-500">
                    {datum(k.gesendet_am)}
                  </td>
                  <td className="py-2">{k.betreff}</td>
                  <td className="py-2 text-slate-500">
                    {k.empfaenger}
                    {k.fehlgeschlagen > 0 && ` (${k.fehlgeschlagen} Fehler)`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
