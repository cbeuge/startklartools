"use server";

import bcrypt from "bcryptjs";
import { queryOne } from "@/db/pool";
import { requireAdmin, createSession } from "@/lib/auth";

export type KontoState = { ok?: boolean; error?: string };

export async function passwortAendern(
  _prev: KontoState,
  formData: FormData,
): Promise<KontoState> {
  const admin = await requireAdmin();

  const aktuell = String(formData.get("aktuell") ?? "");
  const neu = String(formData.get("neu") ?? "");
  const neu2 = String(formData.get("neu2") ?? "");

  if (neu.length < 12) {
    return { error: "Das neue Passwort braucht mindestens 12 Zeichen." };
  }
  if (neu !== neu2) {
    return { error: "Die beiden neuen Passwörter stimmen nicht überein." };
  }

  const row = await queryOne<{ password_hash: string }>(
    "SELECT password_hash FROM admin_users WHERE id = $1",
    [admin.id],
  );
  if (!row || !(await bcrypt.compare(aktuell, row.password_hash))) {
    return { error: "Das aktuelle Passwort stimmt nicht." };
  }

  const hash = await bcrypt.hash(neu, 12);
  const upd = await queryOne<{ session_version: number }>(
    `UPDATE admin_users
        SET password_hash = $1, session_version = session_version + 1
      WHERE id = $2
      RETURNING session_version`,
    [hash, admin.id],
  );

  // Sofort eine frische Sitzung, sonst sperrt der eigene Wechsel einen aus.
  await createSession(admin.id, admin.email, upd!.session_version);
  return { ok: true };
}
