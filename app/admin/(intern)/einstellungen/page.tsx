import { alleMetaTags } from "@/lib/meta-tags";
import { MetaTagFormular } from "@/components/admin/MetaTagFormular";
import { metaTagSpeichern, metaTagLoeschen } from "./actions";

export const dynamic = "force-dynamic";

export default async function EinstellungenSeite() {
  const tags = await alleMetaTags();

  return (
    <div>
      <h1 className="text-2xl font-bold">Einstellungen</h1>

      <h2 className="mt-6 text-lg font-semibold">Meta-Tags</h2>
      <p className="mt-1 text-sm text-slate-500">
        Stehen im Kopf jeder öffentlichen Seite. Für die Seitenprüfung der
        Affiliate-Netzwerke.
      </p>

      <div className="mt-4">
        <MetaTagFormular />
      </div>

      <div className="mt-6 space-y-2">
        {tags.map((t) => (
          <form
            key={t.id}
            action={metaTagSpeichern}
            className="rounded-lg border border-slate-200 bg-white p-3"
          >
            <input type="hidden" name="id" value={t.id} />

            <div className="flex flex-wrap items-end gap-3">
              <label className="block">
                <span className="text-xs text-slate-500">Netzwerk</span>
                <input
                  name="notiz"
                  defaultValue={t.notiz}
                  className="mt-1 block rounded border border-slate-300 px-3 py-1.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs text-slate-500">name</span>
                <input
                  name="name"
                  defaultValue={t.name}
                  required
                  spellCheck={false}
                  className="mt-1 block w-64 rounded border border-slate-300 px-3 py-1.5 font-mono text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs text-slate-500">Attribut</span>
                <select
                  name="attribut"
                  defaultValue={t.attribut}
                  className="mt-1 block rounded border border-slate-300 px-3 py-1.5 text-sm"
                >
                  <option value="content">content</option>
                  <option value="value">value</option>
                </select>
              </label>
              <label className="block grow">
                <span className="text-xs text-slate-500">Wert</span>
                <input
                  name="wert"
                  defaultValue={t.wert}
                  required
                  spellCheck={false}
                  className="mt-1 block w-full rounded border border-slate-300 px-3 py-1.5 font-mono text-sm"
                />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  name="aktiv"
                  value="an"
                  defaultChecked={t.aktiv}
                  className="rounded border-slate-300"
                />
                ausliefern
              </label>
              <code className="truncate text-xs text-slate-400">
                {`<meta name="${t.name}" ${t.attribut}="${t.wert}">`}
              </code>
              <div className="ml-auto flex items-center gap-3">
                <button
                  type="submit"
                  className="rounded bg-marke px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Speichern
                </button>
                <button
                  type="submit"
                  formAction={metaTagLoeschen}
                  className="text-sm text-slate-500 hover:text-red-600"
                >
                  löschen
                </button>
              </div>
            </div>
          </form>
        ))}

        {tags.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">
            Noch keine Meta-Tags.
          </p>
        )}
      </div>
    </div>
  );
}
