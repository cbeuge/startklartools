"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { pool, queryOne } from "@/db/pool";
import { requireAdmin } from "@/lib/auth";
import { slugify, randomCode } from "@/lib/slug";

export type ToolFormState = { error?: string };

function istHttpUrl(wert: string): boolean {
  try {
    const u = new URL(wert);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// Freier, eindeutiger Short-Code. Bei Kollision eines abgeleiteten Codes wird
// ein kurzer Zufallszusatz angehaengt.
async function eindeutigerShortCode(
  basis: string,
  exceptId: number | null,
): Promise<string> {
  const stamm = slugify(basis) || "tool";
  let code = stamm;
  for (let versuch = 0; versuch < 6; versuch++) {
    const clash = await queryOne<{ id: number }>(
      "SELECT id FROM tools WHERE short_code = $1 AND ($2::int IS NULL OR id <> $2)",
      [code, exceptId],
    );
    if (!clash) return code;
    code = `${stamm}-${randomCode(4)}`;
  }
  return randomCode(10);
}

export async function toolSpeichern(
  _prev: ToolFormState,
  formData: FormData,
): Promise<ToolFormState> {
  await requireAdmin();

  const idRaw = String(formData.get("id") ?? "");
  const id = idRaw ? Number(idRaw) : null;

  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || name);
  const shortCodeEingabe = String(formData.get("short_code") ?? "").trim();
  const short_description = String(formData.get("short_description") ?? "").trim();
  const affiliate_url = String(formData.get("affiliate_url") ?? "").trim();
  const homepage_url = String(formData.get("homepage_url") ?? "").trim();
  const categoryRaw = String(formData.get("category_id") ?? "");
  const category_id = categoryRaw ? Number(categoryRaw) : null;
  const status =
    formData.get("status") === "veroeffentlicht" ? "veroeffentlicht" : "entwurf";
  const logo_url = String(formData.get("logo_url") ?? "").trim();
  const commission_info = String(formData.get("commission_info") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const beschreibung = String(formData.get("beschreibung") ?? "").trim();
  const preis_stand = String(formData.get("preis_stand") ?? "").trim();
  const fuer_wen = String(formData.get("fuer_wen") ?? "")
    .split("\n")
    .map((z) => z.trim())
    .filter(Boolean);
  const preise = String(formData.get("preise") ?? "")
    .split("\n")
    .map((z) => z.trim())
    .filter(Boolean)
    .map((z) => {
      const [tier = "", price = "", note = ""] = z.split("|").map((s) => s.trim());
      return { tier, price, note };
    });

  if (!name) return { error: "Name fehlt." };
  if (!slug) return { error: "Aus dem Namen lässt sich kein Slug bilden." };
  if (affiliate_url && !istHttpUrl(affiliate_url)) {
    return { error: "Affiliate-Link muss eine http(s)-Adresse sein." };
  }
  if (homepage_url && !istHttpUrl(homepage_url)) {
    return { error: "Anbieter-Seite muss eine http(s)-Adresse sein." };
  }
  if (status === "veroeffentlicht" && !affiliate_url && !homepage_url) {
    return {
      error:
        "Zum Veröffentlichen braucht das Tool einen Affiliate-Link oder eine Anbieter-Seite.",
    };
  }

  // Slug-Kollision
  const slugClash = await queryOne<{ id: number }>(
    "SELECT id FROM tools WHERE slug = $1 AND ($2::int IS NULL OR id <> $2)",
    [slug, id],
  );
  if (slugClash) return { error: `Der Slug „${slug}“ ist schon vergeben.` };

  // Short-Code: explizit gesetzter Wert muss frei sein, sonst wird er
  // abgeleitet und bei Bedarf mit Zufallszusatz eindeutig gemacht.
  let short_code: string;
  if (shortCodeEingabe) {
    short_code = slugify(shortCodeEingabe);
    if (!short_code) return { error: "Der Short-Code ergibt keinen gültigen Wert." };
    const clash = await queryOne<{ id: number }>(
      "SELECT id FROM tools WHERE short_code = $1 AND ($2::int IS NULL OR id <> $2)",
      [short_code, id],
    );
    if (clash) return { error: `Der Short-Code „${short_code}“ ist schon vergeben.` };
  } else {
    short_code = await eindeutigerShortCode(name, id);
  }

  let toolId: number;
  try {
    if (id) {
      await pool.query(
        `UPDATE tools SET
           slug = $1, name = $2, short_description = $3, affiliate_url = $4,
           short_code = $5, category_id = $6, status = $7, logo_url = $8,
           commission_info = $9, notes = $10, beschreibung = $11,
           preise = $12::jsonb, fuer_wen = $13::jsonb, preis_stand = $14,
           homepage_url = $15
         WHERE id = $16`,
        [
          slug, name, short_description, affiliate_url, short_code,
          category_id, status, logo_url, commission_info, notes, beschreibung,
          JSON.stringify(preise), JSON.stringify(fuer_wen), preis_stand,
          homepage_url, id,
        ],
      );
      toolId = id;
    } else {
      const res = await pool.query<{ id: number }>(
        `INSERT INTO tools
           (slug, name, short_description, affiliate_url, short_code,
            category_id, status, logo_url, commission_info, notes,
            beschreibung, preise, fuer_wen, preis_stand, homepage_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13::jsonb,$14,$15)
         RETURNING id`,
        [
          slug, name, short_description, affiliate_url, short_code,
          category_id, status, logo_url, commission_info, notes, beschreibung,
          JSON.stringify(preise), JSON.stringify(fuer_wen), preis_stand,
          homepage_url,
        ],
      );
      toolId = res.rows[0].id;
    }
  } catch (err) {
    console.error(err);
    return { error: "Speichern fehlgeschlagen." };
  }

  revalidatePath("/admin/tools");
  revalidatePath("/", "layout");
  redirect(`/admin/tools/${toolId}?gespeichert=1`);
}

export async function toolLoeschen(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) {
    await pool.query("DELETE FROM tools WHERE id = $1", [id]);
  }
  revalidatePath("/admin/tools");
  revalidatePath("/", "layout");
  redirect("/admin/tools");
}
