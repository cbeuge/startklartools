"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { slugify } from "@/lib/slug";
import {
  toolSpeichern,
  type ToolFormState,
} from "@/app/admin/(intern)/tools/actions";

type Option = { id: number; name: string };

export type ToolInitial = {
  id: number | null;
  slug: string;
  name: string;
  short_description: string;
  affiliate_url: string;
  short_code: string;
  category_id: number | null;
  status: "entwurf" | "veroeffentlicht";
  logo_url: string;
  commission_info: string;
  notes: string;
};

export function ToolFormular({
  initial,
  kategorien,
}: {
  initial: ToolInitial;
  kategorien: Option[];
}) {
  const [state, formAction, pending] = useActionState<ToolFormState, FormData>(
    toolSpeichern,
    {},
  );

  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [slugManuell, setSlugManuell] = useState(Boolean(initial.slug));
  const [shortCode, setShortCode] = useState(initial.short_code);
  const [shortManuell, setShortManuell] = useState(Boolean(initial.short_code));
  const [shortDescription, setShortDescription] = useState(
    initial.short_description,
  );
  const [affiliateUrl, setAffiliateUrl] = useState(initial.affiliate_url);
  const [categoryId, setCategoryId] = useState(
    initial.category_id ? String(initial.category_id) : "",
  );
  const [status, setStatus] = useState<string>(initial.status);
  const [logoUrl, setLogoUrl] = useState(initial.logo_url);
  const [commissionInfo, setCommissionInfo] = useState(initial.commission_info);
  const [notes, setNotes] = useState(initial.notes);

  const wirkslug = useMemo(
    () => (slugManuell ? slug : slugify(name)),
    [slug, slugManuell, name],
  );
  const wirkShort = useMemo(
    () => (shortManuell ? slugify(shortCode) : slugify(name)),
    [shortCode, shortManuell, name],
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {initial.id !== null && (
        <input type="hidden" name="id" value={initial.id} />
      )}
      <input type="hidden" name="slug" value={wirkslug} />

      {state.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <label className="block">
        <span className="text-sm text-slate-600">Name</span>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-600">Slug</span>
          <input
            value={wirkslug}
            onChange={(e) => {
              setSlugManuell(true);
              setSlug(e.target.value);
            }}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">Short-Code</span>
          <input
            name="short_code"
            value={wirkShort}
            onChange={(e) => {
              setShortManuell(true);
              setShortCode(e.target.value);
            }}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm"
          />
          <span className="mt-1 block text-xs text-slate-400">
            Link: /go/{wirkShort || "…"}
          </span>
        </label>
      </div>

      <label className="block">
        <span className="text-sm text-slate-600">Affiliate-Link (Ziel)</span>
        <input
          name="affiliate_url"
          type="url"
          value={affiliateUrl}
          onChange={(e) => setAffiliateUrl(e.target.value)}
          required
          placeholder="https://…"
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-600">Kategorie</span>
          <select
            name="category_id"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
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
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value="entwurf">Entwurf</option>
            <option value="veroeffentlicht">Veröffentlicht</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm text-slate-600">Logo (URL)</span>
        <input
          name="logo_url"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://…"
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        />
      </label>

      <label className="block">
        <span className="text-sm text-slate-600">Kurzbeschreibung</span>
        <textarea
          name="short_description"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-600">
            Provisionshöhe <span className="text-slate-400">(intern)</span>
          </span>
          <input
            name="commission_info"
            value={commissionInfo}
            onChange={(e) => setCommissionInfo(e.target.value)}
            placeholder="z.B. 30 % wiederkehrend"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm text-slate-600">
          Notizen zum Partnerprogramm <span className="text-slate-400">(intern)</span>
        </span>
        <textarea
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-marke px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Speichert …" : "Speichern"}
        </button>
        <Link href="/admin/tools" className="text-sm text-slate-600">
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
