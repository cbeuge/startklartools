"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { query } from "@/db/pool";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export async function kategorieAnlegen(formData: FormData): Promise<void> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const parentRaw = String(formData.get("parent_id") ?? "");
  const parent_id = parentRaw ? Number(parentRaw) : null;

  if (!name) redirect("/admin/kategorien?fehler=name");
  const slug = slugify(name);
  if (!slug) redirect("/admin/kategorien?fehler=slug");

  await query(
    `INSERT INTO categories (slug, name, parent_id, sort_order)
     VALUES ($1, $2, $3, COALESCE((SELECT max(sort_order) + 1 FROM categories), 0))
     ON CONFLICT (slug) DO NOTHING`,
    [slug, name, parent_id],
  );

  revalidatePath("/admin/kategorien");
  redirect("/admin/kategorien");
}

export async function kategorieLoeschen(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isFinite(id)) {
    await query("DELETE FROM categories WHERE id = $1", [id]);
  }
  revalidatePath("/admin/kategorien");
  redirect("/admin/kategorien");
}
