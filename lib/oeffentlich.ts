import "server-only";
import { query, queryOne } from "@/db/pool";

// Icon-SVG einer Kategorie anhand des in categories.icon gespeicherten
// Schlüssels. Inline gerendert, damit currentColor auf die CSS-Farbe greift.
export { iconSvg as kategorieIcon } from "./kategorie-icons";

export type OeffKategorie = {
  id: number;
  slug: string;
  name: string;
  parent_id: number | null;
  icon: string;
};

export type GuideKarte = {
  slug: string;
  title: string;
  excerpt: string;
  hero_image_url: string;
  published_at: string | null;
  kategorie_name: string | null;
  kategorie_slug: string | null;
  kategorie_icon: string | null;
  lesezeit_min: number;
};

export type ToolLink = {
  name: string;
  short_code: string;
  short_description: string;
  affiliate_url: string;
  homepage_url: string;
  kategorie_id: number | null;
  kategorie_name: string | null;
  kategorie_slug: string | null;
};

// Ziel eines Tool-Links: mit Affiliate-Link -> getrackt über /go/ (mit Stern),
// sonst direkt auf die Anbieter-Seite (ohne Stern).
export function toolZiel(
  t: { short_code: string; affiliate_url: string; homepage_url: string },
  artikelSlug?: string,
): { href: string; affiliate: boolean } {
  if (t.affiliate_url) {
    const q = artikelSlug ? `?a=${artikelSlug}` : "";
    return { href: `/go/${t.short_code}${q}`, affiliate: true };
  }
  return { href: t.homepage_url, affiliate: false };
}

// Baut die goZiele-Auflösung für alle /go/<code>-Links in einem Markdown-Text.
// Veröffentlichtes Tool: mit Affiliate-Link bleibt /go/ (getrackt, mit Stern),
// ohne Affiliate-Link direkt auf die Anbieter-Seite. Tool im Entwurf: nur noch
// direkter, ungetrackter Link auf die Anbieter-Seite, ohne Stern und ohne
// Affiliate-Hinweis – so bleibt der Link im veröffentlichten Artikel gültig,
// auch während das Tool überarbeitet wird. Für renderMarkdown(md, { goZiele }).
export async function goZieleFuerText(
  md: string,
  artikelSlug?: string,
): Promise<Record<string, { url: string; affiliate: boolean }>> {
  const codes = [
    ...new Set(
      [...(md ?? "").matchAll(/\/go\/([a-z0-9_-]+)/gi)].map((m) =>
        m[1].toLowerCase(),
      ),
    ),
  ];
  const goZiele: Record<string, { url: string; affiliate: boolean }> = {};
  if (!codes.length) return goZiele;
  const rows = await query<{
    short_code: string;
    affiliate_url: string;
    homepage_url: string;
    status: string;
  }>(
    `SELECT short_code, affiliate_url, homepage_url, status FROM tools
      WHERE lower(short_code) = ANY($1)`,
    [codes],
  );
  for (const r of rows) {
    const code = r.short_code.toLowerCase();
    if (r.status === "veroeffentlicht") {
      const z = toolZiel(r, artikelSlug);
      if (z.href) goZiele[code] = { url: z.href, affiliate: z.affiliate };
    } else {
      const url = r.homepage_url || r.affiliate_url;
      if (url) goZiele[code] = { url, affiliate: false };
    }
  }
  return goZiele;
}

export type Preisstufe = { tier: string; price: string; note: string };

export type ToolDetail = {
  slug: string;
  name: string;
  short_code: string;
  short_description: string;
  beschreibung: string;
  preise: Preisstufe[];
  fuer_wen: string[];
  preis_stand: string;
  featured: boolean;
  affiliate_url: string;
  homepage_url: string;
  logo_url: string;
  kategorie_name: string;
  kategorie_slug: string;
  oberkategorie_name: string | null;
  oberkategorie_slug: string | null;
};

// Alle veröffentlichten Tools für die /tools-Seite, sortiert nach
// Ober- und Unterkategorie.
export function toolsFuerSeite(): Promise<ToolDetail[]> {
  return query<ToolDetail>(`
    SELECT t.slug, t.name, t.short_code, t.short_description, t.beschreibung,
           t.preise, t.fuer_wen, t.preis_stand, t.featured, t.affiliate_url,
           t.homepage_url, t.logo_url,
           c.name AS kategorie_name, c.slug AS kategorie_slug,
           pc.name AS oberkategorie_name, pc.slug AS oberkategorie_slug
      FROM tools t
      JOIN categories c ON c.id = t.category_id
      LEFT JOIN categories pc ON pc.id = c.parent_id
     WHERE t.status = 'veroeffentlicht' AND c.status = 'veroeffentlicht'
     ORDER BY pc.sort_order NULLS FIRST, pc.name NULLS FIRST,
              c.sort_order, c.name, t.name
  `);
}

// Gemeinsame Spaltenliste für Guide-Karten. lesezeit_min: grobe Schätzung
// aus der Wortzahl (200 Wörter/Minute), mindestens 1.
const GUIDE_COLS = `
  a.slug, a.title, a.excerpt, a.hero_image_url, a.published_at,
  c.name AS kategorie_name, c.slug AS kategorie_slug, c.icon AS kategorie_icon,
  GREATEST(1, ceil(
    coalesce(array_length(regexp_split_to_array(btrim(a.content_md), '\\s+'), 1), 1) / 200.0
  ))::int AS lesezeit_min
`;

// Veröffentlichte Oberkategorien für die Themen-Kacheln und den Footer.
// "news" ausgenommen: die Kategorie hat einen eigenen Menüpunkt im Header
// (/themen/news) statt als Thema in Kacheln/Filtern aufzutauchen.
export function themenKategorien(): Promise<OeffKategorie[]> {
  return query<OeffKategorie>(`
    SELECT id, slug, name, parent_id, icon
      FROM categories
     WHERE parent_id IS NULL AND status = 'veroeffentlicht' AND slug <> 'news'
     ORDER BY sort_order, name
  `);
}

export function neuesteGuides(limit = 3): Promise<GuideKarte[]> {
  return query<GuideKarte>(
    `
    SELECT ${GUIDE_COLS}
      FROM articles a
      LEFT JOIN categories c ON c.id = a.category_id
     WHERE a.status = 'veroeffentlicht'
     ORDER BY a.published_at DESC NULLS LAST, a.id DESC
     LIMIT $1
  `,
    [limit],
  );
}

// Guides für die Übersichtsseite. Ohne Kategorie: alle. Mit Kategorie-Slug:
// nur die dieser Kategorie und ihrer veröffentlichten Unterkategorien.
export function guidesUebersicht(kategorieSlug?: string): Promise<GuideKarte[]> {
  if (!kategorieSlug) {
    return query<GuideKarte>(`
      SELECT ${GUIDE_COLS}
        FROM articles a
        LEFT JOIN categories c ON c.id = a.category_id
       WHERE a.status = 'veroeffentlicht'
       ORDER BY a.published_at DESC NULLS LAST, a.id DESC
    `);
  }
  return query<GuideKarte>(
    `
    SELECT ${GUIDE_COLS}
      FROM articles a
      LEFT JOIN categories c ON c.id = a.category_id
     WHERE a.status = 'veroeffentlicht'
       AND a.category_id IN (
         SELECT id FROM categories
          WHERE slug = $1 AND status = 'veroeffentlicht'
          UNION
         SELECT id FROM categories
          WHERE status = 'veroeffentlicht'
            AND parent_id = (SELECT id FROM categories WHERE slug = $1)
       )
     ORDER BY a.published_at DESC NULLS LAST, a.id DESC
  `,
    [kategorieSlug],
  );
}

export function veroeffentlichteTools(): Promise<ToolLink[]> {
  return query<ToolLink>(`
    SELECT t.name, t.short_code, t.short_description, t.affiliate_url,
           t.homepage_url, t.category_id AS kategorie_id,
           c.name AS kategorie_name, c.slug AS kategorie_slug
      FROM tools t
      LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.status = 'veroeffentlicht'
       AND (c.id IS NULL OR c.status = 'veroeffentlicht')
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
  kategorie_icon: string | null;
  lesezeit_min: number;
};

export type VerwandterArtikel = {
  slug: string;
  title: string;
  kategorie_name: string | null;
};

export type ArtikelTool = Pick<
  ToolLink,
  "name" | "short_code" | "short_description" | "affiliate_url" | "homepage_url"
>;

export async function oeffentlicherArtikel(slug: string): Promise<{
  artikel: OeffArtikel;
  tools: ArtikelTool[];
  goZiele: Record<string, { url: string; affiliate: boolean }>;
  verwandt: VerwandterArtikel[];
} | null> {
  const artikel = await queryOne<OeffArtikel>(
    `
    SELECT a.id, a.slug, a.title, a.excerpt, a.content_md, a.meta_title,
           a.meta_description, a.hero_image_url, a.published_at, a.updated_at,
           c.name AS kategorie_name, c.slug AS kategorie_slug, c.icon AS kategorie_icon,
           GREATEST(1, ceil(
             coalesce(array_length(regexp_split_to_array(btrim(a.content_md), '\\s+'), 1), 1) / 200.0
           ))::int AS lesezeit_min
      FROM articles a
      LEFT JOIN categories c ON c.id = a.category_id
     WHERE a.slug = $1 AND a.status = 'veroeffentlicht'
  `,
    [slug],
  );
  if (!artikel) return null;

  const tools = await query<ArtikelTool>(
    `
    SELECT t.name, t.short_code, t.short_description, t.affiliate_url,
           t.homepage_url
      FROM article_tools at
      JOIN tools t ON t.id = at.tool_id
     WHERE at.article_id = $1 AND t.status = 'veroeffentlicht'
     ORDER BY at.sort_order
  `,
    [artikel.id],
  );

  // /go/<code>-Links im Text: mit Affiliate-Link bleiben sie /go/, ohne
  // führen sie direkt auf die Anbieter-Seite (siehe renderMarkdown).
  const goZiele = await goZieleFuerText(artikel.content_md, artikel.slug);

  const verwandt = await query<VerwandterArtikel>(
    `
    SELECT a.slug, a.title, c.name AS kategorie_name
      FROM article_related r
      JOIN articles a ON a.id = r.to_article_id
      LEFT JOIN categories c ON c.id = a.category_id
     WHERE r.from_article_id = $1 AND a.status = 'veroeffentlicht'
     ORDER BY r.sort_order
  `,
    [artikel.id],
  );

  return { artikel, tools, goZiele, verwandt };
}

export function veroeffentlichteArtikelSlugs(): Promise<
  { slug: string; updated_at: string }[]
> {
  return query<{ slug: string; updated_at: string }>(`
    SELECT slug, updated_at FROM articles WHERE status = 'veroeffentlicht'
  `);
}

export async function oeffentlicheKategorie(slug: string): Promise<{
  kategorie: OeffKategorie;
  artikel: GuideKarte[];
  tools: ArtikelTool[];
} | null> {
  const kategorie = await queryOne<OeffKategorie>(
    "SELECT id, slug, name, parent_id, icon FROM categories WHERE slug = $1 AND status = 'veroeffentlicht'",
    [slug],
  );
  if (!kategorie) return null;

  const artikel = await query<GuideKarte>(
    `
    SELECT ${GUIDE_COLS}
      FROM articles a
      LEFT JOIN categories c ON c.id = a.category_id
     WHERE a.status = 'veroeffentlicht'
       AND (a.category_id = $1
            OR a.category_id IN (SELECT id FROM categories WHERE parent_id = $1 AND status = 'veroeffentlicht'))
     ORDER BY a.published_at DESC NULLS LAST, a.id DESC
  `,
    [kategorie.id],
  );

  const tools = await query<ArtikelTool>(
    `
    SELECT t.name, t.short_code, t.short_description, t.affiliate_url,
           t.homepage_url
      FROM tools t
     WHERE t.status = 'veroeffentlicht'
       AND (t.category_id = $1
            OR t.category_id IN (SELECT id FROM categories WHERE parent_id = $1 AND status = 'veroeffentlicht'))
     ORDER BY t.name
  `,
    [kategorie.id],
  );

  return { kategorie, artikel, tools };
}

export function alleKategorienSlugs(): Promise<{ slug: string }[]> {
  return query<{ slug: string }>(
    "SELECT slug FROM categories WHERE status = 'veroeffentlicht'",
  );
}

// Zwei-Buchstaben-Kürzel für die Themen-Kachel (GR, FI …).
export function kuerzel(name: string): string {
  const worte = name.replace(/[^\p{L}\s]/gu, "").trim().split(/\s+/);
  if (worte.length >= 2) {
    return (worte[0]![0]! + worte[1]![0]!).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// "15. Jan. 2024"
export function datum(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
