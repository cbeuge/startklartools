"use client";

import { useActionState, useEffect, useState } from "react";
import {
  newsletterSenden,
  vorschau,
  type VersandState,
} from "@/app/admin/(intern)/newsletter/actions";

export function NewsletterVersand({ empfaenger }: { empfaenger: number }) {
  const [state, formAction, pending] = useActionState<VersandState, FormData>(
    newsletterSenden,
    {},
  );

  const [betreff, setBetreff] = useState("");
  const [inhalt, setInhalt] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      vorschau(inhalt).then(setPreviewHtml).catch(() => setPreviewHtml(""));
    }, 400);
    return () => clearTimeout(t);
  }, [inhalt]);

  function bestaetigen(e: React.FormEvent<HTMLFormElement>) {
    if (
      !confirm(
        `Den Newsletter jetzt an ${empfaenger} bestätigte Empfänger senden?`,
      )
    ) {
      e.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={bestaetigen} className="space-y-4">
      <input type="hidden" name="inhalt" value={inhalt} />

      {state.fehler && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.fehler}
        </p>
      )}
      {state.ergebnis && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.ergebnis.gesendet} versendet
          {state.ergebnis.fehlgeschlagen > 0
            ? `, ${state.ergebnis.fehlgeschlagen} fehlgeschlagen`
            : ""}
          .
        </p>
      )}

      <label className="block">
        <span className="text-sm text-slate-600">Betreff</span>
        <input
          name="betreff"
          value={betreff}
          onChange={(e) => setBetreff(e.target.value)}
          required
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        />
      </label>

      <div>
        <span className="text-sm text-slate-600">Inhalt (Markdown)</span>
        <div className="mt-1 grid gap-4 lg:grid-cols-2">
          <textarea
            value={inhalt}
            onChange={(e) => setInhalt(e.target.value)}
            rows={16}
            className="w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm"
          />
          <div
            className="prose prose-sm max-w-none overflow-auto rounded border border-slate-200 bg-white px-4 py-3"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Ein Abmeldelink wird automatisch unter jede Mail gesetzt.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending || empfaenger === 0}
        className="rounded bg-marke px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending
          ? "Sendet …"
          : `An ${empfaenger} Empfänger senden`}
      </button>
    </form>
  );
}
