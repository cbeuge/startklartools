import "server-only";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

// breaks:true — ein einzelner Zeilenumbruch wird zu <br>. Das passt zu der
// Art, wie Texte hier geschrieben werden (Zeile fuer Zeile, ohne jede
// zweite Zeile leer zu lassen).
marked.setOptions({ gfm: true, breaks: true });

// Zeilen, die mit "[ ] ", "[x] " oder "- [ ] " beginnen, werden zu einer
// echten Markdown-Checkliste. So muss man das fuehrende "- " nicht mitdenken.
function checklistenNormalisieren(md: string): string {
  return md.replace(/^(\s*)(?:-\s*)?\[([ xX])\]\s+/gm, (_m, ws: string, mark: string) => {
    return `${ws}- [${mark.toLowerCase() === "x" ? "x" : " "}] `;
  });
}

// Erkennt einen /go/<short_code>-Link, egal ob relativ oder mit voller Domain.
const GO_LINK = /^(?:https?:\/\/[^/]+)?\/go\/([a-z0-9_-]+)(\?[^#]*)?(#.*)?$/i;

export type MarkdownOptions = {
  // Slug des Artikels, aus dem gerendert wird. Wird an /go/-Links als ?a=
  // angehaengt, damit der Klick dem Artikel zugeordnet werden kann.
  artikelSlug?: string;
};

// Rendert Markdown zu HTML und saeubert es. Wird sowohl fuer die Live-Vorschau
// im Admin als auch fuer die oeffentliche Ausgabe benutzt, damit beide
// denselben Stand zeigen.
export function renderMarkdown(md: string, opts: MarkdownOptions = {}): string {
  const vorbereitet = checklistenNormalisieren(md ?? "");
  const html = marked.parse(vorbereitet, { async: false }) as string;

  const sauber = sanitizeHtml(html, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "a", "ul", "ol", "li", "blockquote",
      "code", "pre", "em", "strong", "del", "hr", "br",
      "img", "table", "thead", "tbody", "tr", "th", "td",
      "figure", "figcaption", "input",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      code: ["class"],
      th: ["align"],
      td: ["align"],
      input: ["type", "checked", "disabled"],
      li: ["class"],
      ul: ["class"],
      ol: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (_tag, attribs) => {
        const href = (attribs.href ?? "").trim();
        const go = href.match(GO_LINK);
        if (go) {
          const code = go[1];
          const query =
            go[2] ?? (opts.artikelSlug ? `?a=${opts.artikelSlug}` : "");
          return {
            tagName: "a",
            attribs: {
              href: `/go/${code}${query}`,
              // sponsored: Suchmaschinen-Hinweis fuer bezahlte Links.
              // Kein noreferrer, damit die Klick-Zuordnung ueber den
              // Referer auch dann noch greift, wenn kein ?a= gesetzt ist.
              rel: "sponsored noopener",
            },
          };
        }
        attribs.rel = attribs.rel || "noopener noreferrer";
        return { tagName: "a", attribs };
      },
    },
  });

  // marked setzt keine Klasse auf Checklisten-Eintraege. Nachtraeglich eine
  // vergeben, damit die Ausgabe den Aufzaehlungspunkt weglassen kann.
  return sauber.replace(/<li>(\s*)<input\b/g, '<li class="aufgabe">$1<input');
}
