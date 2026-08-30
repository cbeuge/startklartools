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
> & { kategorie_name: string | null; klicks: number };

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
              WHERE k.tool_id = t.id AND NOT k.is_bot) AS klicks
      FROM tools t
      LEFT JOIN categories c ON c.id = t.category_id
     ORDER BY t.name
  `);
}

export function tool(id: number): Promise<Tool | null> {
  return queryOne<Tool>("SELECT * FROM tools WHERE id = $1", [id]);
}
