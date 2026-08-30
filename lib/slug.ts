// Wird auch im Browser genutzt (Slug-Vorschau im Formular), deshalb ohne
// Node-Abhaengigkeiten. Eindeutigkeit erzwingt die DB plus Wiederholung im
// Server-Code.

const COMBINING_MARKS = /[̀-ͯ]/g;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function randomCode(len = 6): string {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}
