"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { pool, queryOne } from "@/db/pool";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { renderMarkdown } from "@/lib/markdown";

export type ArtikelFormState = { error?: string };

// Live-Vorschau im Editor. Gleicher Renderpfad wie die oeffentliche Ausgabe.
export async function vorschau(md: string): Promise<string> {
  await requireAdmin();
  return renderMarkdown(md);
}

export async function artikelSpeichern(
  _prev: ArtikelFormState,
  formData: FormData,
): Promise<ArtikelFormState> {
  await requireAdmin();

  const idRaw = String(formData.get("id") ?? "");
  const id = idRaw ? Number(idRaw) : null;

  const title = String(formData.get("title") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || title);
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content_md = String(formData.get("content_md") ?? "");
  const categoryRaw = String(formData.get("category_id") ?? "");
  const category_id = categoryRaw ? Number(categoryRaw) : null;
  const status =
    formData.get("status") === "veroeffentlicht" ? "veroeffentlicht" : "entwurf";
  const meta_title = String(formData.get("meta_title") ?? "").trim();
  const meta_description = String(formData.get("meta_description") ?? "").trim();
  const hero_image_url = String(formData.get("hero_image_url") ?? "").trim();
  const toolIds = formData
    .getAll("tool_ids")
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n));

  if (!title) return { error: "Titel fehlt." };
  if (!slug) {
    return { error: "Aus dem Titel lässt sich kein Slug bilden, bitte manuell setzen." };
  }

  const clash = await queryOne<{ id: number }>(
    "SELECT id FROM articles WHERE slug = $1 AND ($2::int IS NULL OR id <> $2)",
    [slug, id],
  );
  if (clash) return { error: `Der Slug „${slug}“ ist schon vergeben.` };

  let artikelId: number;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (id) {
      await client.query(
        `UPDATE articles SET
           slug = $1, title = $2, excerpt = $3, content_md = $4,
           category_id = $5, status = $6, meta_title = $7,
           meta_description = $8, hero_image_url = $9,
           published_at = CASE
             WHEN $6 = 'veroeffentlicht' AND published_at IS NULL THEN now()
             ELSE published_at
           END
         WHERE id = $10`,
        [
          slug, title, excerpt, content_md, category_id, status,
          meta_title, meta_description, hero_image_url, id,
        ],
      );
      artikelId = id;
    } else {
      const res = await client.query<{ id: number }>(
        `INSERT INTO articles
           (slug, title, excerpt, content_md, category_id, status,
            meta_title, meta_description, hero_image_url, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,
           CASE WHEN $6 = 'veroeffentlicht' THEN now() ELSE NULL END)
         RETURNING id`,
        [
          slug, title, excerpt, content_md, category_id, status,
          meta_title, meta_description, hero_image_url,
        ],
      );
      artikelId = res.rows[0].id;
    }

    await client.query("DELETE FROM article_tools WHERE article_id = $1", [
      artikelId,
    ]);
    for (let i = 0; i < toolIds.length; i++) {
      await client.query(
        `INSERT INTO article_tools (article_id, tool_id, sort_order)
         VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [artikelId, toolIds[i], i],
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return { error: "Speichern fehlgeschlagen." };
  } finally {
    client.release();
  }

  revalidatePath("/admin/artikel");
  redirect(`/admin/artikel/${artikelId}?gespeichert=1`);
}

export async function artikelLoeschen(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) {
    await pool.query("DELETE FROM articles WHERE id = $1", [id]);
  }
  revalidatePath("/admin/artikel");
  redirect("/admin/artikel");
}
