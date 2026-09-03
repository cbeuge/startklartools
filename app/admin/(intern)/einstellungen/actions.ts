"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { query } from "@/db/pool";
import { requireAdmin } from "@/lib/auth";
import {
  attribut,
  metaTagZerlegen,
  nameGueltig,
  wertGueltig,
} from "@/lib/meta-tags";

// lauf zaehlt jeden Versuch hoch. Das Formular haengt als key daran und wird
// dadurch neu aufgebaut: nach einem Fehler mit der Eingabe von eben, nach
// dem Speichern leer. Ohne das raeumt React die Felder nach jeder Aktion ab.
export type MetaTagState = {
  lauf: number;
  ok?: boolean;
  fehler?: string;
  notiz?: string;
  tag?: string;
};

function pubRevalidate() {
  revalidatePath("/admin/einstellungen");
  revalidatePath("/", "layout"); // die Tags haengen im Layout aller Seiten
}

export async function metaTagAnlegen(
  prev: MetaTagState,
  formData: FormData,
): Promise<MetaTagState> {
  await requireAdmin();

  const lauf = prev.lauf + 1;
  const notiz = String(formData.get("notiz") ?? "").trim();
  const tag = String(formData.get("tag") ?? "");

  const zerlegt = metaTagZerlegen(tag);
  if (!zerlegt.ok) return { lauf, fehler: zerlegt.fehler, notiz, tag };

  await query(
    "INSERT INTO meta_tags (notiz, name, attribut, wert) VALUES ($1, $2, $3, $4)",
    [notiz, zerlegt.name, zerlegt.attribut, zerlegt.wert],
  );

  pubRevalidate();
  return { lauf, ok: true };
}

export async function metaTagSpeichern(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const wert = String(formData.get("wert") ?? "").trim();

  // Stimmt hier etwas nicht, bleibt der alte Stand stehen: ein halb
  // gespeicherter Verifizierungs-Tag faellt sonst still durch die Pruefung.
  if (Number.isInteger(id) && nameGueltig(name) && wertGueltig(wert)) {
    await query(
      `UPDATE meta_tags
          SET notiz = $1, name = $2, attribut = $3, wert = $4, aktiv = $5
        WHERE id = $6`,
      [
        String(formData.get("notiz") ?? "").trim(),
        name,
        attribut(String(formData.get("attribut") ?? "")),
        wert,
        formData.get("aktiv") === "an",
        id,
      ],
    );
  }

  pubRevalidate();
  redirect("/admin/einstellungen");
}

export async function metaTagLoeschen(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) {
    await query("DELETE FROM meta_tags WHERE id = $1", [id]);
  }

  pubRevalidate();
  redirect("/admin/einstellungen");
}
