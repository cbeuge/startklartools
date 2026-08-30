import "server-only";
import { query, queryOne } from "@/db/pool";

export type OeffKategorie = {
  id: number;
  slug: string;
  name: string;
  parent_id: number | null;
};

export type GuideKarte = {
  slug: string;
  title: string;
  excerpt: string;
  hero_image_url: string;
  published_at: string | null;
  kategorie_name: string | null;
  kategorie_slug: string | null;
};

export type ToolLink = {
  name: string;
  short_code: string;
  short_description: string;
  kategorie_id: number | null;
  kategorie_name: string | null;
  kategorie_slug: string | null;
};

// Oberkategorien für die Themen-Kacheln und den Footer.
export function themenKategorien(): Promise<OeffKategorie[]> {
  return query<OeffKategorie>(`
    SELECT id, slug, name, parent_id
      FROM categories
     WHERE parent_id IS NULL
     ORDER BY sort_order, name
  `);
}

export function neuesteGuides(limit = 3): Promise<GuideKarte[]> {
  return query<GuideKarte>(
    `
    SELECT a.slug, a.title, a.excerpt, a.hero_image_url, a.published_at,
           c.name AS kategorie_name, c.slug AS kategorie_slug
      FROM articles a
      LEFT JOIN categories c ON c.id = a.category_id
     WHERE a.status = 'veroeffentlicht'
     ORDER BY a.published_at DESC NULLS LAST, a.id DESC
     LIMIT $1
  `,
    [limit],
  );
}

export function alleGuides(): Promise<GuideKarte[]> {
  return query<GuideKarte>(`
    SELECT a.slug, a.title, a.excerpt, a.hero_image_url, a.published_at,
           c.name AS kategorie_name, c.slug AS kategorie_slug
      FROM articles a
      LEFT JOIN categories c ON c.id = a.category_id
     WHERE a.status = 'veroeffentlicht'
     ORDER BY a.published_at DESC NULLS LAST, a.id DESC
  `);
}

export function veroeffentlichteTools(): Promise<ToolLink[]> {
  return query<ToolLink>(`
    SELECT t.name, t.short_code, t.short_description,
           t.category_id AS kategorie_id,
           c.name AS kategorie_name, c.slug AS kategorie_slug
      FROM tools t
      LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.status = 'veroeffentlicht'
     ORDER BY c.sort_order NULLS LAST, c.name NULLS LAST, t.name
  `);
}

export type OeffArtikel = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content_md: string;
  meta_title: string;
  meta_description: string;
  hero_image_url: string;
  published_at: string | null;
  updated_at: string;
  kategorie_name: string | null;
  kategorie_slug: string | null;
};

export async function oeffentlicherArtikel(slug: string): Promise<{
  artikel: OeffArtikel;
  tools: Pick<ToolLink, "name" | "short_code" | "short_description">[];
} | null> {
  const artikel = await queryOne<OeffArtikel>(
    `
    SELECT a.id, a.slug, a.title, a.excerpt, a.content_md, a.meta_title,
           a.meta_description, a.hero_image_url, a.published_at, a.updated_at,
           c.name AS kategorie_name, c.slug AS kategorie_slug
      FROM articles a
      LEFT JOIN categories c ON c.id = a.category_id
     WHERE a.slug = $1 AND a.status = 'veroeffentlicht'
  `,
    [slug],
  );
  if (!artikel) return null;

  const tools = await query<
    Pick<ToolLink, "name" | "short_code" | "short_description">
  >(
    `
    SELECT t.name, t.short_code, t.short_description
      FROM article_tools at
      JOIN tools t ON t.id = at.tool_id
     WHERE at.article_id = $1 AND t.status = 'veroeffentlicht'
     ORDER BY at.sort_order
  `,
    [artikel.id],
  );

  return { artikel, tools };
}

export function veroeffentlichteArtikelSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  return query<{ slug: string; updated_at: string }>(`
    SELECT slug, updated_at FROM articles WHERE status = 'veroeffentlicht'
  `);
}

export async function oeffentlicheKategorie(slug: string): Promise<{
  kategorie: OeffKategorie;
  artikel: GuideKarte[];
  tools: Pick<ToolLink, "name" | "short_code" | "short_description">[];
} | null> {
  const kategorie = await queryOne<OeffKategorie>(
    "SELECT id, slug, name, parent_id FROM categories WHERE slug = $1",
    [slug],
  );
  if (!kategorie) return null;

  const artikel = await query<GuideKarte>(
    `
    SELECT a.slug, a.title, a.excerpt, a.hero_image_url, a.published_at,
           c.name AS kategorie_name, c.slug AS kategorie_slug
      FROM articles a
      LEFT JOIN categories c ON c.id = a.category_id
     WHERE a.status = 'veroeffentlicht'
       AND (a.category_id = $1
            OR a.category_id IN (SELECT id FROM categories WHERE parent_id = $1))
     ORDER BY a.published_at DESC NULLS LAST, a.id DESC
  `,
    [kategorie.id],
  );

  const tools = await query<
    Pick<ToolLink, "name" | "short_code" | "short_description">
  >(
    `
    SELECT t.name, t.short_code, t.short_description
      FROM tools t
     WHERE t.status = 'veroeffentlicht'
       AND (t.category_id = $1
            OR t.category_id IN (SELECT id FROM categories WHERE parent_id = $1))
     ORDER BY t.name
  `,
    [kategorie.id],
  );

  return { kategorie, artikel, tools };
}

export function alleKategorienSlugs(): Promise<{ slug: string }[]> {
  return query<{ slug: string }>("SELECT slug FROM categories");
}

// Zwei-Buchstaben-Kürzel für die Themen-Kachel (GR, FI …).
export function kuerzel(name: string): string {
  const worte = name.replace(/[^\p{L}\s]/gu, "").trim().split(/\s+/);
  if (worte.length >= 2) {
    return (worte[0]![0]! + worte[1]![0]!).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
