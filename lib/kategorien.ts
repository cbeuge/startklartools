import "server-only";
import { query, queryOne } from "@/db/pool";

export type KategorieStatus = "entwurf" | "veroeffentlicht";

export type Kategorie = {
  id: number;
  slug: string;
  name: string;
  parent_id: number | null;
  sort_order: number;
  status: KategorieStatus;
};

// Alle Kategorien, auch Entwürfe – fürs Admin (Auswahllisten, Verwaltung).
export function alleKategorien(): Promise<Kategorie[]> {
  return query<Kategorie>(
    "SELECT * FROM categories ORDER BY sort_order, name",
  );
}

export function kategorie(id: number): Promise<Kategorie | null> {
  return queryOne<Kategorie>("SELECT * FROM categories WHERE id = $1", [id]);
}
