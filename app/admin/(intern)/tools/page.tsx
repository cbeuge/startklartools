import Link from "next/link";
import { toolListe } from "@/lib/tools";

const STATUS_LABEL: Record<string, string> = {
  entwurf: "Entwurf",
  veroeffentlicht: "Veröffentlicht",
};

export default async function ToolsListe() {
  const tools = await toolListe();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tools</h1>
        <Link
          href="/admin/tools/neu"
          className="rounded bg-marke px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Neues Tool
        </Link>
      </div>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="py-2">Name</th>
            <th className="py-2">Short-Link</th>
            <th className="py-2">Kategorie</th>
            <th className="py-2">Status</th>
            <th className="py-2 text-right">Klicks</th>
          </tr>
        </thead>
        <tbody>
          {tools.map((t) => (
            <tr key={t.id} className="border-b border-slate-100">
              <td className="py-2">
                <Link
                  href={`/admin/tools/${t.id}`}
                  className="font-medium text-marke hover:underline"
                >
                  {t.name}
                </Link>
              </td>
              <td className="py-2 font-mono text-xs text-slate-500">
                /go/{t.short_code}
              </td>
              <td className="py-2">{t.kategorie_name ?? "–"}</td>
              <td className="py-2">
                <span
                  className={
                    t.status === "veroeffentlicht"
                      ? "text-green-700"
                      : "text-slate-500"
                  }
                >
                  {STATUS_LABEL[t.status] ?? t.status}
                </span>
              </td>
              <td className="py-2 text-right tabular-nums">{t.klicks}</td>
            </tr>
          ))}
          {tools.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-slate-400">
                Noch keine Tools.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
