import Link from "next/link";
import { query } from "@/db/pool";

async function zahlen() {
  const [row] = await query<{
    artikel_veroeffentlicht: string;
    artikel_entwurf: string;
    tools_gesamt: string;
    klicks_7_tage: string;
    newsletter_bestaetigt: string;
  }>(`
    SELECT
      (SELECT count(*) FROM articles WHERE status = 'veroeffentlicht') AS artikel_veroeffentlicht,
      (SELECT count(*) FROM articles WHERE status = 'entwurf')          AS artikel_entwurf,
      (SELECT count(*) FROM tools)                                      AS tools_gesamt,
      (SELECT count(*) FROM clicks
         WHERE NOT is_bot
           AND clicked_at >= now() - interval '7 days')                 AS klicks_7_tage,
      (SELECT count(*) FROM newsletter_subscribers
         WHERE confirmed_at IS NOT NULL AND unsubscribed_at IS NULL)    AS newsletter_bestaetigt
  `);
  return row;
}

export default async function AdminDashboard() {
  const z = await zahlen();

  const kacheln = [
    { label: "Artikel veröffentlicht", wert: z.artikel_veroeffentlicht },
    { label: "Artikel Entwurf", wert: z.artikel_entwurf },
    { label: "Tools", wert: z.tools_gesamt },
    { label: "Klicks (7 Tage)", wert: z.klicks_7_tage },
    { label: "Newsletter bestätigt", wert: z.newsletter_bestaetigt },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Übersicht</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
      <div className="mt-8 flex gap-3">
        <Link
          href="/admin/artikel/neu"
          className="rounded bg-marke px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Neuer Artikel
        </Link>
        <Link
          href="/admin/artikel"
          className="rounded border border-slate-300 px-4 py-2 text-sm"
        >
          Alle Artikel
        </Link>
      </div>
    </div>
  );
}
