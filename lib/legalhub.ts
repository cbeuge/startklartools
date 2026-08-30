import "server-only";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { rechtstextSaeubern } from "./rechtstext-saeubern";

/**
 * Rechtstexte aus LegalHub (legal.carstenbeuge.de), wie bei den anderen Marken.
 * Cache jünger als 24 h wird genommen, sonst frisch geholt; schlägt der Abruf
 * fehl, gilt der letzte bekannte Stand — Impressum und Datenschutz dürfen nie
 * leer sein. Der Dateicache liegt neben der Anwendung, nicht im Next-Cache, der
 * bei jedem Deploy neu gebaut wird.
 *
 * Der Domain-Slug in LegalHub muss `startklartools` heißen (analog `bestellonede`,
 * `xtranude`). Existiert er dort noch nicht, liefert diese Funktion null und die
 * Seite zeigt einen Platzhalter.
 */
const BASIS = "https://legal.carstenbeuge.de/api/v1/legal";
const DOMAIN_SLUG = "startklartools";
const CACHE_DIR = path.join(process.cwd(), "cache", "legal");
const MAX_ALTER_MS = 24 * 60 * 60 * 1000;
const ZEITGRENZE_MS = 5000;

export type Kategorie = "impressum" | "datenschutz";

async function ausCache(
  datei: string,
): Promise<{ inhalt: string; alterMs: number } | null> {
  try {
    const info = await stat(datei);
    return {
      inhalt: await readFile(datei, "utf8"),
      alterMs: Date.now() - info.mtimeMs,
    };
  } catch {
    return null;
  }
}

async function abrufen(kategorie: Kategorie): Promise<string | null> {
  try {
    const antwort = await fetch(`${BASIS}/${DOMAIN_SLUG}/${kategorie}`, {
      signal: AbortSignal.timeout(ZEITGRENZE_MS),
      cache: "no-store",
    });
    if (!antwort.ok) return null;
    const daten = (await antwort.json()) as { inhalt?: string };
    const inhalt = daten.inhalt?.trim();
    return inhalt ? inhalt : null;
  } catch {
    return null;
  }
}

export async function rechtstext(kategorie: Kategorie): Promise<string | null> {
  const datei = path.join(CACHE_DIR, `${DOMAIN_SLUG}_${kategorie}.html`);

  const zwischenstand = await ausCache(datei);
  if (zwischenstand && zwischenstand.alterMs < MAX_ALTER_MS) {
    return rechtstextSaeubern(zwischenstand.inhalt);
  }

  const frisch = await abrufen(kategorie);
  if (frisch) {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(datei, frisch, "utf8");
    return rechtstextSaeubern(frisch);
  }

  return zwischenstand ? rechtstextSaeubern(zwischenstand.inhalt) : null;
}
