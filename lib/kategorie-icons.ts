/**
 * Icon-Bibliothek für Kategorien. Der Schlüssel wird in categories.icon
 * gespeichert und im Admin ausgewählt. SVGs mit stroke="currentColor",
 * damit die Farbe aus dem CSS kommt (Akzentfarbe auf den Kacheln).
 *
 * Kein server-only: auch die Admin-Auswahl (Client) importiert diese Liste.
 */

export type KategorieIcon = { label: string; svg: string };

const S = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">`;

export const KATEGORIE_ICONS: Record<string, KategorieIcon> = {
  spross: {
    label: "Spross (Gründung)",
    svg: `${S}<line x1="12" y1="40" x2="36" y2="40" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="24" y1="40" x2="24" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M24 24 Q10 20 8 6 Q20 10 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 18 Q36 14 38 2 Q26 6 24 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  euro: {
    label: "Euro im Kreis (Finanzen)",
    svg: `${S}<circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="2"/><text x="24" y="25" text-anchor="middle" dominant-baseline="central" font-size="20" font-weight="500" fill="currentColor" stroke="none" font-family="sans-serif">€</text></svg>`,
  },
  sprechblase: {
    label: "Sprechblase (Kunden)",
    svg: `${S}<rect x="6" y="10" width="36" height="24" rx="8" stroke="currentColor" stroke-width="2"/><path d="M14 34 L10 44 L20 35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="24" y1="16" x2="24" y2="27" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="18.5" y1="21.5" x2="29.5" y2="21.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  },
  checkliste: {
    label: "Checkliste (Organisation)",
    svg: `${S}<rect x="6" y="8" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M7.5 12 L9 13.8 L13 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><rect x="6" y="20" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M7.5 24 L9 25.8 L13 21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><rect x="6" y="32" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.6"/><line x1="20" y1="12" x2="42" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="20" y1="24" x2="42" y2="24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="20" y1="36" x2="38" y2="36" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/></svg>`,
  },
  waage: {
    label: "Waage (Rechtliches)",
    svg: `${S}<circle cx="24" cy="8" r="2" fill="currentColor" stroke="none"/><line x1="24" y1="10" x2="24" y2="38" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="38" x2="32" y2="38" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="10" x2="40" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="10" x2="8" y2="20" stroke="currentColor" stroke-width="1.6"/><line x1="40" y1="10" x2="40" y2="20" stroke="currentColor" stroke-width="1.6"/><path d="M2 20 Q8 28 14 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M34 20 Q40 28 46 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  },
  prozent: {
    label: "Prozent (Steuern)",
    svg: `${S}<line x1="14" y1="34" x2="34" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="16" r="5" stroke="currentColor" stroke-width="2"/><circle cx="32" cy="32" r="5" stroke="currentColor" stroke-width="2"/></svg>`,
  },
  monitor: {
    label: "Monitor (Website)",
    svg: `${S}<rect x="6" y="8" width="36" height="26" rx="2" stroke="currentColor" stroke-width="2"/><line x1="18" y1="40" x2="30" y2="40" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="24" y1="34" x2="24" y2="40" stroke="currentColor" stroke-width="2"/></svg>`,
  },
  uhr: {
    label: "Uhr (Zeit)",
    svg: `${S}<circle cx="24" cy="24" r="17" stroke="currentColor" stroke-width="2"/><path d="M24 13 V24 L32 28" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  dokument: {
    label: "Dokument (Verträge)",
    svg: `${S}<path d="M12 6 H28 L36 14 V42 H12 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M28 6 V14 H36" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><line x1="18" y1="24" x2="30" y2="24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="18" y1="30" x2="30" y2="30" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="18" y1="36" x2="26" y2="36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  },
  ordner: {
    label: "Ordner (Ablage)",
    svg: `${S}<path d="M6 12 H18 L22 16 H42 V38 H6 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  },
  bank: {
    label: "Gebäude (Bank / Behörde)",
    svg: `${S}<path d="M24 6 L42 16 H6 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><line x1="12" y1="18" x2="12" y2="34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="24" y1="18" x2="24" y2="34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="36" y1="18" x2="36" y2="34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="40" x2="40" y2="40" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  },
  megafon: {
    label: "Megafon (Marketing)",
    svg: `${S}<path d="M8 20 V28 L18 28 L32 38 V10 L18 20 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M37 18 Q42 24 37 30" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M15 28 L17 40" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  },
  rakete: {
    label: "Rakete (Durchstarten)",
    svg: `${S}<path d="M24 4 C31 10 33 20 31 30 H17 C15 20 17 10 24 4 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="24" cy="19" r="3.5" stroke="currentColor" stroke-width="2"/><path d="M17 30 L10 37 L17 35 M31 30 L38 37 L31 35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 35 Q24 44 27 35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  },
  gluehbirne: {
    label: "Glühbirne (Idee)",
    svg: `${S}<path d="M24 5 A13 13 0 0 1 33 28 Q31 30 31 34 H17 Q17 30 15 28 A13 13 0 0 1 24 5 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><line x1="19" y1="38" x2="29" y2="38" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="21" y1="42" x2="27" y2="42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  },
  wachstum: {
    label: "Wachstum (Umsatz)",
    svg: `${S}<path d="M8 8 V40 H42" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 32 L22 24 L28 28 L40 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 14 H40 V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
};

export const ICON_KEYS = Object.keys(KATEGORIE_ICONS);

export function iconSvg(key: string | null | undefined): string | null {
  if (!key) return null;
  return KATEGORIE_ICONS[key]?.svg ?? null;
}
