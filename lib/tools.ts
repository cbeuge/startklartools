import "server-only";
import { query, queryOne } from "@/db/pool";

export type ToolStatus = "entwurf" | "veroeffentlicht";

export type Tool = {
  id: number;
  slug: string;
  name: string;
  short_description: string;
  affiliate_url: string;
  short_code: string;
  category_id: number | null;
  status: ToolStatus;
  logo_url: string;
  commission_info: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type ToolAuswahl = Pick<Tool, "id" | "name" | "short_code">;

export type ToolZeile = Pick<
  Tool,
  "id" | "name" | "slug" | "short_code" | "status"
> & { kategorie_name: string | null; klicks: number; artikel_anzahl: number };

// Ein Tool gilt als in einem Artikel verlinkt, wenn es entweder über die
// "Verlinkte Tools"-Haken zugeordnet ist oder wenn im Text ein
// /go/<short_code>-Link steht.
const GO_REGEX = `'(^|[^a-z0-9_-])go/' || t.short_code || '($|[^a-z0-9_-])'`;

const VERLINKT_BEDINGUNG = `(
  EXISTS (SELECT 1 FROM article_tools at
            WHERE at.article_id = a.id AND at.tool_id = t.id)
  OR a.content_md ~ (${GO_REGEX})
)`;

export function toolsFuerAuswahl(): Promise<ToolAuswahl[]> {
  return query<ToolAuswahl>(
    "SELECT id, name, short_code FROM tools ORDER BY name",
  );
}

export function toolListe(): Promise<ToolZeile[]> {
  return query<ToolZeile>(`
    SELECT t.id, t.name, t.slug, t.short_code, t.status,
           c.name AS kategorie_name,
           (SELECT count(*)::int FROM clicks k
              WHERE k.tool_id = t.id AND NOT k.is_bot) AS klicks,
           (SELECT count(*)::int FROM articles a WHERE ${VERLINKT_BEDINGUNG})
             AS artikel_anzahl
      FROM tools t
      LEFT JOIN categories c ON c.id = t.category_id
     ORDER BY t.name
  `);
}

export type ToolArtikel = {
  id: number;
  title: string;
  status: string;
  via_kasten: boolean;
  via_text: boolean;
};

// Artikel, in denen dieses Tool verlinkt ist – für die Tool-Bearbeitungsseite.
export function toolArtikel(toolId: number): Promise<ToolArtikel[]> {
  return query<ToolArtikel>(
    `
    SELECT a.id, a.title, a.status,
           EXISTS (SELECT 1 FROM article_tools at
                     WHERE at.article_id = a.id AND at.tool_id = t.id) AS via_kasten,
           (a.content_md ~ (${GO_REGEX})) AS via_text
      FROM articles a
      CROSS JOIN tools t
     WHERE t.id = $1 AND ${VERLINKT_BEDINGUNG}
     ORDER BY a.title
  `,
    [toolId],
  );
}

export function tool(id: number): Promise<Tool | null> {
  return queryOne<Tool>("SELECT * FROM tools WHERE id = $1", [id]);
}
