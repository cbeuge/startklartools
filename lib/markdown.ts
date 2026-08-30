import "server-only";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

marked.setOptions({ gfm: true, breaks: false });

// Rendert Markdown zu HTML und saeubert es. Wird sowohl fuer die Live-Vorschau
// im Admin als auch fuer die oeffentliche Ausgabe benutzt, damit beide
// denselben Stand zeigen.
export function renderMarkdown(md: string): string {
  const html = marked.parse(md ?? "", { async: false }) as string;
  return sanitizeHtml(html, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "a", "ul", "ol", "li", "blockquote",
      "code", "pre", "em", "strong", "del", "hr", "br",
      "img", "table", "thead", "tbody", "tr", "th", "td",
      "figure", "figcaption",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      code: ["class"],
      th: ["align"],
      td: ["align"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}
