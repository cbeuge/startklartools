import Link from "next/link";
import { artikelListe } from "@/lib/artikel";

const STATUS_LABEL: Record<string, string> = {
  entwurf: "Entwurf",
  veroeffentlicht: "Veröffentlicht",
};

export default async function ArtikelListe() {
  const artikel = await artikelListe();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Artikel</h1>
        <Link
          href="/admin/artikel/neu"
          className="rounded bg-marke px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Neuer Artikel
        </Link>
      </div>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="py-2">Titel</th>
            <th className="py-2">Kategorie</th>
            <th className="py-2">Status</th>
            <th className="py-2">Geändert</th>
          </tr>
        </thead>
        <tbody>
          {artikel.map((a) => (
            <tr key={a.id} className="border-b border-slate-100">
              <td className="py-2">
                <Link
                  href={`/admin/artikel/${a.id}`}
                  className="font-medium text-marke hover:underline"
                >
                  {a.title}
                </Link>
                <span className="ml-2 font-mono text-xs text-slate-400">
                  {a.slug}
                </span>
              </td>
              <td className="py-2">{a.kategorie_name ?? "–"}</td>
              <td className="py-2">
                <span
                  className={
                    a.status === "veroeffentlicht"
                      ? "text-green-700"
                      : "text-slate-500"
                  }
                >
                  {STATUS_LABEL[a.status] ?? a.status}
                </span>
              </td>
              <td className="py-2 text-slate-500">
                {new Date(a.updated_at).toLocaleDateString("de-DE")}
              </td>
            </tr>
          ))}
          {artikel.length === 0 && (
            <tr>
              <td colSpan={4} className="py-8 text-center text-slate-400">
                Noch keine Artikel.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
