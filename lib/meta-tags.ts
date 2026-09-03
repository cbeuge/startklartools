import "server-only";
import { query } from "@/db/pool";

export type MetaAttribut = "content" | "value";

export type MetaTag = {
  id: number;
  notiz: string;
  name: string;
  attribut: MetaAttribut;
  wert: string;
  aktiv: boolean;
};

export function alleMetaTags(): Promise<MetaTag[]> {
  return query<MetaTag>("SELECT * FROM meta_tags ORDER BY id");
}

export function aktiveMetaTags(): Promise<MetaTag[]> {
  return query<MetaTag>("SELECT * FROM meta_tags WHERE aktiv ORDER BY id");
}

// Namen wie google-site-verification oder impact-site-verification.
const NAME_MUSTER = /^[A-Za-z][A-Za-z0-9._:-]*$/;

export function nameGueltig(name: string): boolean {
  return NAME_MUSTER.test(name);
}

// React maskiert beim Ausgeben ohnehin, aber ein Wert mit spitzen Klammern
// oder Zeilenumbruch ist immer ein Vertipper beim Kopieren.
export function wertGueltig(wert: string): boolean {
  return wert.length > 0 && !/[<>\r\n\t]/.test(wert);
}

export function attribut(roh: string): MetaAttribut {
  return roh === "value" ? "value" : "content";
}

export type ZerlegtesErgebnis =
  | { ok: true; name: string; attribut: MetaAttribut; wert: string }
  | { ok: false; fehler: string };

/**
 * Zerlegt einen kompletten <meta>-Tag, so wie ihn das Netzwerk zum Kopieren
 * hinstellt. Absichtlich streng: nur ein einzelner meta-Tag, nur die
 * Attribute name, content und value. Alles andere wird abgelehnt statt still
 * geschluckt, sonst landet ein halb verstandener Schnipsel im Seitenkopf.
 */
export function metaTagZerlegen(eingabe: string): ZerlegtesErgebnis {
  const roh = eingabe.trim();
  if (!roh) return { ok: false, fehler: "Kein Tag eingegeben." };

  const tag = /^<meta\s+([^<>]*?)\/?>$/i.exec(roh);
  if (!tag) {
    return {
      ok: false,
      fehler:
        "Das ist kein einzelner <meta>-Tag. Kopiere die Zeile so, wie das Netzwerk sie anzeigt.",
    };
  }

  const attribute = new Map<string, string>();
  const muster =
    /([A-Za-z][A-Za-z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
  let rest = tag[1];
  let treffer: RegExpExecArray | null;
  while ((treffer = muster.exec(tag[1])) !== null) {
    attribute.set(
      treffer[1].toLowerCase(),
      treffer[2] ?? treffer[3] ?? treffer[4] ?? "",
    );
    rest = rest.replace(treffer[0], "");
  }
  if (rest.trim()) {
    return { ok: false, fehler: `Unverständlicher Teil im Tag: ${rest.trim()}` };
  }

  const unbekannt = [...attribute.keys()].filter(
    (k) => k !== "name" && k !== "content" && k !== "value",
  );
  if (unbekannt.length > 0) {
    return {
      ok: false,
      fehler: `Unterstützt werden nur name, content und value. Nicht erlaubt: ${unbekannt.join(", ")}`,
    };
  }

  const name = attribute.get("name")?.trim() ?? "";
  if (!nameGueltig(name)) {
    return { ok: false, fehler: "Im Tag fehlt ein brauchbares name-Attribut." };
  }

  const hatContent = attribute.has("content");
  const hatValue = attribute.has("value");
  if (hatContent === hatValue) {
    return {
      ok: false,
      fehler: hatContent
        ? "Der Tag hat content und value zugleich. Nur eines von beiden."
        : "Im Tag fehlt content bzw. value.",
    };
  }

  const attr: MetaAttribut = hatValue ? "value" : "content";
  const wert = (attribute.get(attr) ?? "").trim();
  if (!wertGueltig(wert)) {
    return {
      ok: false,
      fehler: `Der Wert in ${attr}= ist leer oder enthält unerlaubte Zeichen.`,
    };
  }

  return { ok: true, name, attribut: attr, wert };
}
