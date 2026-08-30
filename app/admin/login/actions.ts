"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { queryOne } from "@/db/pool";
import { createSession } from "@/lib/auth";

export async function anmelden(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const passwort = String(formData.get("passwort") ?? "");

  const row = await queryOne<{
    id: number;
    email: string;
    password_hash: string;
    session_version: number;
  }>(
    "SELECT id, email, password_hash, session_version FROM admin_users WHERE email = $1",
    [email],
  );

  const ok = row ? await bcrypt.compare(passwort, row.password_hash) : false;
  if (!row || !ok) {
    redirect("/admin/login?fehler=1");
  }

  await createSession(row.id, row.email, row.session_version);
  redirect("/admin");
}
