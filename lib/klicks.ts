import "server-only";
import { query } from "@/db/pool";

export type KlickProTool = {
  id: number;
  name: string;
  gesamt: number;
  letzte_30: number;
};

export type KlickProArtikel = {
  id: number;
  title: string;
  gesamt: number;
  letzte_30: number;
};

export type KlickProTag = { tag: string; anzahl: number };

// Echte Klicks (ohne Bots). Tagesgrenze in Europe/Berlin, der Server laeuft
// auf UTC.
export async function klickUebersicht(): Promise<{
  gesamt: number;
  letzte_7: number;
  proTool: KlickProTool[];
  proArtikel: KlickProArtikel[];
  proTag: KlickProTag[];
}> {
  const [summe] = await query<{ gesamt: number; letzte_7: number }>(`
    SELECT
      count(*)::int AS gesamt,
      count(*) FILTER (WHERE clicked_at >= now() - interval '7 days')::int AS letzte_7
    FROM clicks
    WHERE NOT is_bot
  `);

  const proTool = await query<KlickProTool>(`
    SELECT t.id, t.name,
           count(c.*)::int AS gesamt,
           count(c.*) FILTER (
             WHERE c.clicked_at >= now() - interval '30 days'
           )::int AS letzte_30
      FROM tools t
      LEFT JOIN clicks c ON c.tool_id = t.id AND NOT c.is_bot
     GROUP BY t.id, t.name
     ORDER BY gesamt DESC, t.name
  `);

  const proArtikel = await query<KlickProArtikel>(`
    SELECT a.id, a.title,
           count(c.*)::int AS gesamt,
           count(c.*) FILTER (
             WHERE c.clicked_at >= now() - interval '30 days'
           )::int AS letzte_30
      FROM articles a
      JOIN clicks c ON c.article_id = a.id AND NOT c.is_bot
     GROUP BY a.id, a.title
     ORDER BY gesamt DESC
  `);

  const proTag = await query<KlickProTag>(`
    SELECT to_char(
             (clicked_at AT TIME ZONE 'Europe/Berlin')::date, 'YYYY-MM-DD'
           ) AS tag,
           count(*)::int AS anzahl
      FROM clicks
     WHERE NOT is_bot
       AND clicked_at >= now() - interval '30 days'
     GROUP BY tag
     ORDER BY tag
  `);

  return {
    gesamt: summe?.gesamt ?? 0,
    letzte_7: summe?.letzte_7 ?? 0,
    proTool,
    proArtikel,
    proTag,
  };
}
