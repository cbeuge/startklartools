import sanitizeHtml from "sanitize-html";

/**
 * Säubert das HTML der Rechtstexte aus LegalHub, bevor es über
 * dangerouslySetInnerHTML in die Seite geht. Erlaubnisliste, keine Sperrliste.
 * Gleiche Idee wie in bestellone/xtranu: sonst hinge die Sicherheit der Seite
 * an einer zweiten Anwendung auf einem anderen Host, und der Dateicache würde
 * einen bösartigen Text festhalten.
 */
const ERLAUBTE_TAGS = [
  "p", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "strong", "b", "em", "i", "u", "small", "sup", "sub",
  "a", "span", "div",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  "blockquote", "pre", "code",
];

export function rechtstextSaeubern(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ERLAUBTE_TAGS,
    allowedAttributes: { a: ["href", "title", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    nonTextTags: [
      "script", "style", "textarea", "option", "noscript", "iframe", "template",
    ],
    transformTags: {
      a: (tagName, attribs) =>
        attribs.target
          ? {
              tagName,
              attribs: {
                ...attribs,
                rel: attribs.rel || "noopener noreferrer",
              },
            }
          : { tagName, attribs },
    },
  });
}
