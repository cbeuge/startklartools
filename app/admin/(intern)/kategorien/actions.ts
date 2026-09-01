"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { query } from "@/db/pool";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { KATEGORIE_ICONS } from "@/lib/kategorie-icons";

function icon(formData: FormData): string {
  const v = String(formData.get("icon") ?? "");
  return v in KATEGORIE_ICONS ? v : "";
}

function pubRevalidate() {
  revalidatePath("/admin/kategorien");
  revalidatePath("/", "layout"); // Kopf/Fuß + Startseite + Themenseiten
}

export async function kategorieAnlegen(formData: FormData): Promise<void> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const parentRaw = String(formData.get("parent_id") ?? "");
  const parent_id = parentRaw ? Number(parentRaw) : null;
  const status =
    formData.get("status") === "veroeffentlicht" ? "veroeffentlicht" : "entwurf";

  if (!name) redirect("/admin/kategorien?fehler=name");
  const slug = slugify(name);
  if (!slug) redirect("/admin/kategorien?fehler=slug");

  await query(
    `INSERT INTO categories (slug, name, parent_id, status, icon, sort_order)
     VALUES ($1, $2, $3, $4, $5, COALESCE((SELECT max(sort_order) + 1 FROM categories), 0))
     ON CONFLICT (slug) DO NOTHING`,
    [slug, name, parent_id, status, icon(formData)],
  );

  pubRevalidate();
  redirect("/admin/kategorien");
}

export async function kategorieBearbeiten(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const parentRaw = String(formData.get("parent_id") ?? "");
  const parent_id = parentRaw ? Number(parentRaw) : null;
  const status =
    formData.get("status") === "veroeffentlicht" ? "veroeffentlicht" : "entwurf";

  if (!Number.isInteger(id)) redirect("/admin/kategorien");
  if (!name) redirect("/admin/kategorien?fehler=name");
  // Eine Kategorie kann nicht ihre eigene Oberkategorie sein.
  const parent = parent_id === id ? null : parent_id;

  await query(
    `UPDATE categories SET name = $1, parent_id = $2, status = $3, icon = $4 WHERE id = $5`,
    [name, parent, status, icon(formData), id],
  );

  pubRevalidate();
  redirect("/admin/kategorien");
}

export async function kategorieLoeschen(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) {
    await query("DELETE FROM categories WHERE id = $1", [id]);
  }
  pubRevalidate();
  redirect("/admin/kategorien");
}
