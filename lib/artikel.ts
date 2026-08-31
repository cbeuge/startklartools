import "server-only";
import { query, queryOne } from "@/db/pool";

export type ArtikelStatus = "entwurf" | "veroeffentlicht";

export type Artikel = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content_md: string;
  category_id: number | null;
  status: ArtikelStatus;
  meta_title: string;
  meta_description: string;
  hero_image_url: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ArtikelZeile = Pick<
  Artikel,
  "id" | "slug" | "title" | "status" | "updated_at"
> & { kategorie_name: string | null };

export type ArtikelAuswahl = Pick<Artikel, "id" | "title" | "slug"> & {
  status: ArtikelStatus;
};

export function artikelListe(): Promise<ArtikelZeile[]> {
  return query<ArtikelZeile>(`
    SELECT a.id, a.slug, a.title, a.status, a.updated_at,
           c.name AS kategorie_name
      FROM articles a
      LEFT JOIN categories c ON c.id = a.category_id
     ORDER BY a.updated_at DESC
  `);
}

export function artikel(id: number): Promise<Artikel | null> {
  return queryOne<Artikel>("SELECT * FROM articles WHERE id = $1", [id]);
}

export async function artikelToolIds(articleId: number): Promise<number[]> {
  const rows = await query<{ tool_id: number }>(
    "SELECT tool_id FROM article_tools WHERE article_id = $1 ORDER BY sort_order",
    [articleId],
  );
  return rows.map((r) => r.tool_id);
}

// Alle Artikel für die "Passt dazu"-Auswahl im Editor.
export function artikelFuerAuswahl(): Promise<ArtikelAuswahl[]> {
  return query<ArtikelAuswahl>(
    "SELECT id, title, slug, status FROM articles ORDER BY title",
  );
}

// IDs der Artikel, auf die dieser Artikel verweist (in Kasten-Reihenfolge).
export async function artikelVerwandtIds(articleId: number): Promise<number[]> {
  const rows = await query<{ to_article_id: number }>(
    "SELECT to_article_id FROM article_related WHERE from_article_id = $1 ORDER BY sort_order",
    [articleId],
  );
  return rows.map((r) => r.to_article_id);
}
