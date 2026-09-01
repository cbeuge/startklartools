import { createHash } from "node:crypto";
import { NextResponse, after } from "next/server";
import { pool, queryOne } from "@/db/pool";

export const dynamic = "force-dynamic";

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|monitor|pingdom|curl|wget/i;

function klientIp(req: Request): string {
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return "";
}

// Tages-Hash: erlaubt grobe Unique-Zaehlung, ohne die IP zu speichern.
function ipHash(ip: string): string {
  if (!ip) return "";
  const tag = new Date().toISOString().slice(0, 10);
  return createHash("sha256")
    .update(`${process.env.IP_HASH_SALT ?? ""}:${tag}:${ip}`)
    .digest("hex");
}

async function artikelId(req: Request): Promise<number | null> {
  const url = new URL(req.url);
  const aParam = url.searchParams.get("a");
  if (aParam) {
    const row = await queryOne<{ id: number }>(
      "SELECT id FROM articles WHERE slug = $1",
      [aParam],
    );
    if (row) return row.id;
  }
  // Rueckfall: Referer  …/ratgeber/<slug>
  const ref = req.headers.get("referer");
  if (ref) {
    try {
      const m = new URL(ref).pathname.match(/\/ratgeber\/([^/?#]+)/);
      if (m) {
        const row = await queryOne<{ id: number }>(
          "SELECT id FROM articles WHERE slug = $1",
          [m[1]],
        );
        if (row) return row.id;
      }
    } catch {
      // ungueltiger Referer, ignorieren
    }
  }
  return null;
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ code: string }> },
) {
  const { code } = await ctx.params;

  const t = await queryOne<{
    id: number;
    affiliate_url: string;
    homepage_url: string;
    status: string;
  }>(
    "SELECT id, affiliate_url, homepage_url, status FROM tools WHERE short_code = $1",
    [code],
  );
  // Veröffentlicht: Affiliate-Link, sonst Anbieter-Seite. Im Entwurf (z.B.
  // während einer Überarbeitung) leiten alte Links weiter auf die
  // Anbieter-Seite, damit nichts ins Leere läuft.
  const ziel =
    t &&
    (t.status === "veroeffentlicht"
      ? t.affiliate_url || t.homepage_url
      : t.homepage_url || t.affiliate_url);
  if (!t || !ziel) {
    return new NextResponse("Link nicht gefunden.", { status: 404 });
  }

  const ua = req.headers.get("user-agent") ?? "";
  const referrer = req.headers.get("referer") ?? "";
  const isBot = BOT.test(ua) || ua === "";
  const hash = ipHash(klientIp(req));
  const artId = await artikelId(req);

  // Nach der Antwort schreiben, damit die Weiterleitung nicht wartet.
  after(async () => {
    try {
      await pool.query(
        `INSERT INTO clicks
           (tool_id, article_id, referrer, user_agent, ip_hash, is_bot)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [t.id, artId, referrer.slice(0, 500), ua.slice(0, 500), hash, isBot],
      );
    } catch (err) {
      console.error("Klick konnte nicht gespeichert werden:", err);
    }
  });

  return NextResponse.redirect(ziel, 302);
}
