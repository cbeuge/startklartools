import { klickUebersicht } from "@/lib/klicks";

function Balken({ wert, max }: { wert: number; max: number }) {
  const breite = max > 0 ? Math.round((wert / max) * 100) : 0;
  return (
    <div className="h-2 w-full rounded bg-slate-100">
      <div
        className="h-2 rounded bg-marke"
        style={{ width: `${breite}%` }}
      />
    </div>
  );
}

export default async function KlicksDashboard() {
  const { gesamt, letzte_7, proTool, proArtikel, proTag } =
    await klickUebersicht();

  const maxTag = Math.max(1, ...proTag.map((t) => t.anzahl));
  const maxTool = Math.max(1, ...proTool.map((t) => t.gesamt));
  const maxArtikel = Math.max(1, ...proArtikel.map((a) => a.gesamt));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Klicks</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ohne Bot-Zugriffe. Tagesgrenze deutsche Zeit.
        </p>
        <div className="mt-4 flex gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-2xl font-semibold">{gesamt}</div>
            <div className="text-xs text-slate-500">Gesamt</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-2xl font-semibold">{letzte_7}</div>
            <div className="text-xs text-slate-500">Letzte 7 Tage</div>
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold">Verlauf (30 Tage)</h2>
        {proTag.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">Noch keine Klicks.</p>
        ) : (
          <div className="mt-3 space-y-1">
            {proTag.map((t) => (
              <div key={t.tag} className="flex items-center gap-3 text-xs">
                <span className="w-20 shrink-0 text-slate-500">{t.tag}</span>
                <Balken wert={t.anzahl} max={maxTag} />
                <span className="w-8 shrink-0 text-right tabular-nums">
                  {t.anzahl}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Pro Tool</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2">Tool</th>
              <th className="py-2 w-1/3">Anteil</th>
              <th className="py-2 text-right">30 Tage</th>
              <th className="py-2 text-right">Gesamt</th>
            </tr>
          </thead>
          <tbody>
            {proTool.map((t) => (
              <tr key={t.id} className="border-b border-slate-100">
                <td className="py-2">{t.name}</td>
                <td className="py-2">
                  <Balken wert={t.gesamt} max={maxTool} />
                </td>
                <td className="py-2 text-right tabular-nums">{t.letzte_30}</td>
                <td className="py-2 text-right tabular-nums">{t.gesamt}</td>
              </tr>
            ))}
            {proTool.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400">
                  Noch keine Tools.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Pro Artikel</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2">Artikel</th>
              <th className="py-2 w-1/3">Anteil</th>
              <th className="py-2 text-right">30 Tage</th>
              <th className="py-2 text-right">Gesamt</th>
            </tr>
          </thead>
          <tbody>
            {proArtikel.map((a) => (
              <tr key={a.id} className="border-b border-slate-100">
                <td className="py-2">{a.title}</td>
                <td className="py-2">
                  <Balken wert={a.gesamt} max={maxArtikel} />
                </td>
                <td className="py-2 text-right tabular-nums">{a.letzte_30}</td>
                <td className="py-2 text-right tabular-nums">{a.gesamt}</td>
              </tr>
            ))}
            {proArtikel.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400">
                  Noch keine Klicks aus Artikeln.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
