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
  homepage_url: string;
  short_code: string;
  category_id: number | null;
  status: "entwurf" | "veroeffentlicht";
  featured: boolean;
  logo_url: string;
  commission_info: string;
  notes: string;
  beschreibung: string;
  preis_stand: string;
  fuer_wen_text: string;
  preise_text: string;
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
  const [homepageUrl, setHomepageUrl] = useState(initial.homepage_url);
  const [categoryId, setCategoryId] = useState(
    initial.category_id ? String(initial.category_id) : "",
  );
  const [status, setStatus] = useState<string>(initial.status);
  const [featured, setFeatured] = useState(initial.featured);
  const [logoUrl, setLogoUrl] = useState(initial.logo_url);
  const [commissionInfo, setCommissionInfo] = useState(initial.commission_info);
  const [notes, setNotes] = useState(initial.notes);
  const [beschreibung, setBeschreibung] = useState(initial.beschreibung);
  const [preisStand, setPreisStand] = useState(initial.preis_stand);
  const [fuerWenText, setFuerWenText] = useState(initial.fuer_wen_text);
  const [preiseText, setPreiseText] = useState(initial.preise_text);

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

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-600">Affiliate-Link (Ziel)</span>
          <input
            name="affiliate_url"
            type="url"
            value={affiliateUrl}
            onChange={(e) => setAffiliateUrl(e.target.value)}
            placeholder="https://…"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">
            Anbieter-Seite{" "}
            <span className="text-slate-400">
              (Ziel, solange kein Affiliate-Link da ist)
            </span>
          </span>
          <input
            name="homepage_url"
            type="url"
            value={homepageUrl}
            onChange={(e) => setHomepageUrl(e.target.value)}
            placeholder="https://…"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
      </div>
      <p className="-mt-2 text-xs text-slate-400">
        <span className="font-mono">/go/{wirkShort || "…"}</span> leitet auf den
        Affiliate-Link, sonst auf die Anbieter-Seite. Zum Veröffentlichen muss
        mindestens eins von beiden gesetzt sein.
      </p>

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

      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          name="featured"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="mt-1"
        />
        <span className="text-sm text-slate-600">
          Hauptempfehlung
          <span className="block text-xs text-slate-400">
            steht auf der /tools-Seite ganz oben, über dem Kategorie-Filter
          </span>
        </span>
      </label>

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
        <span className="text-sm text-slate-600">
          Kurzbeschreibung / Tagline{" "}
          <span className="text-slate-400">(eine Zeile, im Artikel-Kasten)</span>
        </span>
        <textarea
          name="short_description"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        />
      </label>

      <label className="block">
        <span className="text-sm text-slate-600">
          Beschreibung <span className="text-slate-400">(für die /tools-Seite)</span>
        </span>
        <textarea
          name="beschreibung"
          value={beschreibung}
          onChange={(e) => setBeschreibung(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-600">
            „Passt, wenn du …"{" "}
            <span className="text-slate-400">(ein Punkt pro Zeile)</span>
          </span>
          <textarea
            name="fuer_wen"
            value={fuerWenText}
            onChange={(e) => setFuerWenText(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">
            Preise{" "}
            <span className="text-slate-400">
              (pro Zeile: Stufe | Preis | Hinweis)
            </span>
          </span>
          <textarea
            name="preise"
            value={preiseText}
            onChange={(e) => setPreiseText(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-xs"
          />
        </label>
      </div>

      <label className="block sm:max-w-xs">
        <span className="text-sm text-slate-600">Preis-Stand</span>
        <input
          name="preis_stand"
          value={preisStand}
          onChange={(e) => setPreisStand(e.target.value)}
          placeholder="z.B. Preise geprüft 09/2026"
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
