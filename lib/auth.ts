import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { queryOne } from "@/db/pool";

const COOKIE = "startklar_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 Tage

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET fehlt");
  return new TextEncoder().encode(s);
}

export type Admin = { id: number; email: string };

export async function createSession(
  userId: number,
  email: string,
  sessionVersion: number,
): Promise<void> {
  const token = await new SignJWT({ email, sv: sessionVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

// Prueft die Sitzung bei jeder Anfrage gegen die Datenbank: Konto muss noch
// existieren und die session_version muss stimmen. Ein Passwortwechsel zaehlt
// session_version hoch und entwertet damit alte Anmeldungen.
export async function getAdmin(): Promise<Admin | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    const id = Number(payload.sub);
    const sv = Number((payload as { sv?: unknown }).sv);
    if (!Number.isFinite(id) || !Number.isFinite(sv)) return null;

    const row = await queryOne<{
      id: number;
      email: string;
      session_version: number;
    }>(
      "SELECT id, email, session_version FROM admin_users WHERE id = $1",
      [id],
    );
    if (!row || row.session_version !== sv) return null;
    return { id: row.id, email: row.email };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
