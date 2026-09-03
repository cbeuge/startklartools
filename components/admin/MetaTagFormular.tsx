"use client";

import { useActionState } from "react";
import {
  metaTagAnlegen,
  type MetaTagState,
} from "@/app/admin/(intern)/einstellungen/actions";

export function MetaTagFormular() {
  const [state, formAction, pending] = useActionState<MetaTagState, FormData>(
    metaTagAnlegen,
    { lauf: 0 },
  );

  return (
    <form
      key={state.lauf}
      action={formAction}
      className="rounded-lg border border-slate-200 bg-white p-4"
    >
      {state.ok && (
        <p className="mb-3 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Tag hinzugefügt.
        </p>
      )}
      {state.fehler && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.fehler}
        </p>
      )}

      <label className="block">
        <span className="text-sm text-slate-600">Netzwerk</span>
        <input
          name="notiz"
          defaultValue={state.notiz ?? ""}
          placeholder="N26 (über Impact)"
          className="mt-1 block w-full max-w-sm rounded border border-slate-300 px-3 py-2"
        />
      </label>

      <label className="mt-3 block">
        <span className="text-sm text-slate-600">Meta-Tag</span>
        <textarea
          name="tag"
          defaultValue={state.tag ?? ""}
          required
          rows={2}
          spellCheck={false}
          placeholder={`<meta name="impact-site-verification" value="…">`}
          className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm"
        />
        <span className="mt-1 block text-xs text-slate-500">
          Kompletten Tag einfügen, so wie das Netzwerk ihn anzeigt.
        </span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-3 rounded bg-marke px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "…" : "Hinzufügen"}
      </button>
    </form>
  );
}
