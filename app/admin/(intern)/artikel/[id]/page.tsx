import { notFound } from "next/navigation";
import { artikel, artikelToolIds } from "@/lib/artikel";
import { alleKategorien } from "@/lib/kategorien";
import { toolsFuerAuswahl } from "@/lib/tools";
import { ArtikelFormular } from "@/components/admin/ArtikelFormular";
import { artikelLoeschen } from "../actions";

export default async function ArtikelBearbeiten({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gespeichert?: string }>;
}) {
  const { id } = await params;
  const artikelId = Number(id);
  if (!Number.isInteger(artikelId)) notFound();

  const [a, kategorien, tools] = await Promise.all([
    artikel(artikelId),
    alleKategorien(),
    toolsFuerAuswahl(),
  ]);
  if (!a) notFound();

  const toolIds = await artikelToolIds(a.id);
  const { gespeichert } = await searchParams;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Artikel bearbeiten</h1>
        <form action={artikelLoeschen}>
          <input type="hidden" name="id" value={a.id} />
          <button
            type="submit"
            className="text-sm text-slate-500 hover:text-red-600"
          >
            Artikel löschen
          </button>
        </form>
      </div>

      {gespeichert && (
        <p className="mt-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Gespeichert.
        </p>
      )}

      <div className="mt-6">
        <ArtikelFormular
          kategorien={kategorien}
          tools={tools}
          initial={{
            id: a.id,
            slug: a.slug,
            title: a.title,
            excerpt: a.excerpt,
            content_md: a.content_md,
            category_id: a.category_id,
            status: a.status,
            meta_title: a.meta_title,
            meta_description: a.meta_description,
            hero_image_url: a.hero_image_url,
            toolIds,
          }}
        />
      </div>
    </div>
  );
}
