import { alleKategorien } from "@/lib/kategorien";
import { kategorieAnlegen, kategorieLoeschen } from "./actions";

export default async function KategorienPage({
  searchParams,
}: {
  searchParams: Promise<{ fehler?: string }>;
}) {
  const kategorien = await alleKategorien();
  const { fehler } = await searchParams;
  const nameById = new Map(kategorien.map((k) => [k.id, k.name]));

  return (
    <div>
      <h1 className="text-2xl font-bold">Kategorien</h1>

      <form
        action={kategorieAnlegen}
        className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
      >
        <div>
          <label htmlFor="name" className="block text-sm text-slate-600">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            className="mt-1 rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="parent_id" className="block text-sm text-slate-600">
            Oberkategorie
          </label>
          <select
            id="parent_id"
            name="parent_id"
            className="mt-1 rounded border border-slate-300 px-3 py-2"
          >
            <option value="">– keine –</option>
            {kategorien.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded bg-marke px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Anlegen
        </button>
        {fehler && (
          <span className="text-sm text-red-600">
            {fehler === "name" ? "Name fehlt." : "Name ergibt keinen gültigen Slug."}
          </span>
        )}
      </form>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="py-2">Name</th>
            <th className="py-2">Slug</th>
            <th className="py-2">Oberkategorie</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {kategorien.map((k) => (
            <tr key={k.id} className="border-b border-slate-100">
              <td className="py-2">{k.name}</td>
              <td className="py-2 font-mono text-xs text-slate-500">{k.slug}</td>
              <td className="py-2">
                {k.parent_id ? nameById.get(k.parent_id) ?? "–" : "–"}
              </td>
              <td className="py-2 text-right">
                <form action={kategorieLoeschen}>
                  <input type="hidden" name="id" value={k.id} />
                  <button
                    type="submit"
                    className="text-slate-500 hover:text-red-600"
                  >
                    löschen
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {kategorien.length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-center text-slate-400">
                Noch keine Kategorien.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
