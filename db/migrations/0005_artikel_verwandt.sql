-- Artikel ↔ Artikel: redaktionelle "Passt dazu"-Verweise.
-- Gerichtet: from verweist auf to. sort_order bestimmt die Reihenfolge im
-- Kasten am Artikelende. Analog zu article_tools, nur Artikel-zu-Artikel.
CREATE TABLE article_related (
  from_article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  to_article_id   INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (from_article_id, to_article_id),
  CHECK (from_article_id <> to_article_id)
);
CREATE INDEX article_related_to_idx ON article_related(to_article_id);
