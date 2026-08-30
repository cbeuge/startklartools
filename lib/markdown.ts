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

// Rendert Markdown zu HTML und saeubert es. Wird sowohl fuer die Live-Vorschau
// im Admin als auch fuer die oeffentliche Ausgabe benutzt, damit beide
// denselben Stand zeigen.
export function renderMarkdown(md: string): string {
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
      // GFM-Checklisten: marked gibt <input type="checkbox" disabled> aus.
      input: ["type", "checked", "disabled"],
      li: ["class"],
      ul: ["class"],
      ol: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });

  // marked setzt keine Klasse auf Checklisten-Eintraege. Nachtraeglich eine
  // vergeben, damit die Ausgabe den Aufzaehlungspunkt weglassen kann.
  return sauber.replace(
    /<li>(\s*)<input\b/g,
    '<li class="aufgabe">$1<input',
  );
}
