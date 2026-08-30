"use client";

import { useActionState, useState } from "react";
import {
  passwortAendern,
  type KontoState,
} from "@/app/admin/(intern)/konto/actions";

export function KontoFormular() {
  const [state, formAction, pending] = useActionState<KontoState, FormData>(
    passwortAendern,
    {},
  );
  const [aktuell, setAktuell] = useState("");
  const [neu, setNeu] = useState("");
  const [neu2, setNeu2] = useState("");

  return (
    <form action={formAction} className="max-w-sm space-y-4">
      {state.ok && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Passwort geändert.
        </p>
      )}
      {state.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <label className="block">
        <span className="text-sm text-slate-600">Aktuelles Passwort</span>
        <input
          type="password"
          name="aktuell"
          autoComplete="current-password"
          value={aktuell}
          onChange={(e) => setAktuell(e.target.value)}
          required
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        />
      </label>
      <label className="block">
        <span className="text-sm text-slate-600">Neues Passwort</span>
        <input
          type="password"
          name="neu"
          autoComplete="new-password"
          value={neu}
          onChange={(e) => setNeu(e.target.value)}
          required
          minLength={12}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        />
      </label>
      <label className="block">
        <span className="text-sm text-slate-600">Neues Passwort wiederholen</span>
        <input
          type="password"
          name="neu2"
          autoComplete="new-password"
          value={neu2}
          onChange={(e) => setNeu2(e.target.value)}
          required
          minLength={12}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-marke px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "…" : "Passwort ändern"}
      </button>
    </form>
  );
}
