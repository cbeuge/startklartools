"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { slugify } from "@/lib/slug";
import {
  artikelSpeichern,
  vorschau,
  type ArtikelFormState,
} from "@/app/admin/(intern)/artikel/actions";

type Option = { id: number; name: string };
type ToolOption = { id: number; name: string; short_code: string };
type ArtikelOption = {
  id: number;
  title: string;
  slug: string;
  status: "entwurf" | "veroeffentlicht";
};

export type ArtikelInitial = {
  id: number | null;
  slug: string;
  title: string;
  excerpt: string;
  content_md: string;
  category_id: number | null;
  status: "entwurf" | "veroeffentlicht";
  meta_title: string;
  meta_description: string;
  hero_image_url: string;
  toolIds: number[];
  relatedIds: number[];
};

export function ArtikelFormular({
  initial,
  kategorien,
  tools,
  artikel,
}: {
  initial: ArtikelInitial;
  kategorien: Option[];
  tools: ToolOption[];
  artikel: ArtikelOption[];
}) {
  const [state, formAction, pending] = useActionState<ArtikelFormState, FormData>(
    artikelSpeichern,
    {},
  );

  // Alle Felder im State, damit sie eine abgelehnte Server-Aktion ueberstehen.
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugManuell, setSlugManuell] = useState(Boolean(initial.slug));
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [contentMd, setContentMd] = useState(initial.content_md);
  const [categoryId, setCategoryId] = useState(
    initial.category_id ? String(initial.category_id) : "",
  );
  const [status, setStatus] = useState<string>(initial.status);
  const [metaTitle, setMetaTitle] = useState(initial.meta_title);
  const [metaDescription, setMetaDescription] = useState(initial.meta_description);
  const [heroImageUrl, setHeroImageUrl] = useState(initial.hero_image_url);
  const [toolIds, setToolIds] = useState<Set<number>>(
    new Set(initial.toolIds),
  );
  const [relatedIds, setRelatedIds] = useState<Set<number>>(
    new Set(initial.relatedIds),
  );

  const wirkslug = useMemo(
    () => (slugManuell ? slug : slugify(title)),
    [slug, slugManuell, title],
  );

  // Live-Vorschau, entprellt
  const [previewHtml, setPreviewHtml] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      vorschau(contentMd).then(setPreviewHtml).catch(() => setPreviewHtml(""));
    }, 500);
    return () => clearTimeout(t);
  }, [contentMd]);

  function toggleTool(id: number) {
    setToolIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleRelated(id: number) {
    setRelatedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const andereArtikel = artikel.filter((a) => a.id !== initial.id);

  return (
    <form action={formAction} className="space-y-6">
      {initial.id !== null && (
        <input type="hidden" name="id" value={initial.id} />
      )}
      <input type="hidden" name="slug" value={wirkslug} />
      <input type="hidden" name="content_md" value={contentMd} />
      {[...toolIds].map((id) => (
        <input key={id} type="hidden" name="tool_ids" value={id} />
      ))}
      {[...relatedIds].map((id) => (
        <input key={id} type="hidden" name="related_ids" value={id} />
      ))}

      {state.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-600">Titel</span>
          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
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
          <span className="mt-1 block text-xs text-slate-400">
            /ratgeber/{wirkslug || "…"}
          </span>
        </label>
      </div>

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
        <span className="text-sm text-slate-600">Titelbild (URL)</span>
        <input
          name="hero_image_url"
          value={heroImageUrl}
          onChange={(e) => setHeroImageUrl(e.target.value)}
          placeholder="https://…"
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        />
      </label>

      <label className="block">
        <span className="text-sm text-slate-600">Kurzbeschreibung / Anrisstext</span>
        <textarea
          name="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        />
      </label>

      <div>
        <span className="text-sm text-slate-600">Inhalt (Markdown)</span>
        <details className="mt-1 text-xs text-slate-500">
          <summary className="cursor-pointer">Formatierung</summary>
          <div className="mt-2 space-y-0.5 rounded border border-slate-200 bg-slate-50 p-3 font-mono">
            <div>## Überschrift &nbsp;·&nbsp; ### kleinere Überschrift</div>
            <div>**fett** &nbsp;·&nbsp; *kursiv*</div>
            <div>- Aufzählungspunkt (Bindestrich, dann Leerzeichen)</div>
            <div>1. Nummerierte Liste</div>
            <div>[ ] offener Haken &nbsp;·&nbsp; [x] erledigter Haken</div>
            <div>[Linktext](https://…)</div>
            <div>[Tool-Name](/go/kurzcode) &nbsp;→&nbsp; getrackter Affiliate-Link</div>
            <div>![Bildtext](https://…/bild.jpg)</div>
            <div>&gt; Zitat</div>
          </div>
          <p className="mt-2 font-sans">
            Für einen Absatzwechsel eine Leerzeile lassen. Eine einzelne neue
            Zeile bleibt im selben Absatz, wird aber umgebrochen.
          </p>
          <p className="mt-1 font-sans">
            Affiliate-Links immer über{" "}
            <span className="font-mono">/go/kurzcode</span> setzen, nicht direkt
            auf die Anbieter-Seite – sonst wird der Klick nicht gezählt. Den
            Kurzcode findest du beim jeweiligen Tool.
          </p>
        </details>
        <div className="mt-2 grid gap-4 lg:grid-cols-2">
          <textarea
            value={contentMd}
            onChange={(e) => setContentMd(e.target.value)}
            rows={20}
            className="w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm"
          />
          <div
            className="prose prose-sm max-w-none overflow-auto rounded border border-slate-200 bg-white px-4 py-3"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      </div>

      <fieldset className="rounded-lg border border-slate-200 p-4">
        <legend className="px-1 text-sm text-slate-600">Verlinkte Tools</legend>
        {tools.length === 0 ? (
          <p className="text-sm text-slate-400">
            Noch keine Tools angelegt.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {tools.map((t) => (
              <label key={t.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={toolIds.has(t.id)}
                  onChange={() => toggleTool(t.id)}
                />
                {t.name}
                <span className="font-mono text-xs text-slate-400">
                  /go/{t.short_code}
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <fieldset className="rounded-lg border border-slate-200 p-4">
        <legend className="px-1 text-sm text-slate-600">
          Passt dazu (andere Artikel)
        </legend>
        <p className="mb-3 text-xs text-slate-400">
          Erscheint als Kasten „Passt dazu“ am Ende dieses Artikels. Nur
          veröffentlichte Verweise werden öffentlich gezeigt.
        </p>
        {andereArtikel.length === 0 ? (
          <p className="text-sm text-slate-400">Keine anderen Artikel vorhanden.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {andereArtikel.map((a) => (
              <label key={a.id} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={relatedIds.has(a.id)}
                  onChange={() => toggleRelated(a.id)}
                />
                <span>
                  {a.title}
                  {a.status === "entwurf" && (
                    <span className="ml-1 text-xs text-slate-400">(Entwurf)</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-600">Meta-Titel (SEO)</span>
          <input
            name="meta_title"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">Meta-Beschreibung (SEO)</span>
          <input
            name="meta_description"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-marke px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Speichert …" : "Speichern"}
        </button>
        <Link href="/admin/artikel" className="text-sm text-slate-600">
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
