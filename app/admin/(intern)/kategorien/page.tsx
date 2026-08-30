import { alleKategorien } from "@/lib/kategorien";
import {
  kategorieAnlegen,
  kategorieBearbeiten,
  kategorieLoeschen,
} from "./actions";

export default async function KategorienPage({
  searchParams,
}: {
  searchParams: Promise<{ fehler?: string }>;
}) {
  const kategorien = await alleKategorien();
  const { fehler } = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-bold">Kategorien</h1>

      {fehler && (
        <p className="mt-3 text-sm text-red-600">
          {fehler === "name" ? "Name fehlt." : "Name ergibt keinen gültigen Slug."}
        </p>
      )}

      <form
        action={kategorieAnlegen}
        className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
      >
        <label className="block">
          <span className="text-sm text-slate-600">Name</span>
          <input
            name="name"
            required
            className="mt-1 block rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">Oberkategorie</span>
          <select
            name="parent_id"
            className="mt-1 block rounded border border-slate-300 px-3 py-2"
          >
            <option value="">– keine –</option>
            {kategorien.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">Status</span>
          <select
            name="status"
            defaultValue="entwurf"
            className="mt-1 block rounded border border-slate-300 px-3 py-2"
          >
            <option value="entwurf">Entwurf</option>
            <option value="veroeffentlicht">Veröffentlicht</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded bg-marke px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Anlegen
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {kategorien.map((k) => (
          <form
            key={k.id}
            action={kategorieBearbeiten}
            className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-3"
          >
            <input type="hidden" name="id" value={k.id} />
            <label className="block">
              <span className="text-xs text-slate-500">Name</span>
              <input
                name="name"
                defaultValue={k.name}
                required
                className="mt-1 block rounded border border-slate-300 px-3 py-1.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Oberkategorie</span>
              <select
                name="parent_id"
                defaultValue={k.parent_id ?? ""}
                className="mt-1 block rounded border border-slate-300 px-3 py-1.5 text-sm"
              >
                <option value="">– keine –</option>
                {kategorien
                  .filter((andere) => andere.id !== k.id)
                  .map((andere) => (
                    <option key={andere.id} value={andere.id}>
                      {andere.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Status</span>
              <select
                name="status"
                defaultValue={k.status}
                className="mt-1 block rounded border border-slate-300 px-3 py-1.5 text-sm"
              >
                <option value="entwurf">Entwurf</option>
                <option value="veroeffentlicht">Veröffentlicht</option>
              </select>
            </label>
            <span className="pb-1.5 font-mono text-xs text-slate-400">
              /themen/{k.slug}
            </span>
            <div className="ml-auto flex items-center gap-3 pb-1">
              <button
                type="submit"
                className="rounded bg-marke px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Speichern
              </button>
              <button
                type="submit"
                formAction={kategorieLoeschen}
                className="text-sm text-slate-500 hover:text-red-600"
              >
                löschen
              </button>
            </div>
          </form>
        ))}
        {kategorien.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">
            Noch keine Kategorien.
          </p>
        )}
      </div>
    </div>
  );
}
