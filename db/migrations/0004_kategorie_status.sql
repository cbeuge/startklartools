-- Kategorien bekommen wie Artikel und Tools einen Status. Bestehende
-- Kategorien bleiben sichtbar (Default veroeffentlicht).

ALTER TABLE categories
  ADD COLUMN status TEXT NOT NULL DEFAULT 'veroeffentlicht'
    CHECK (status IN ('entwurf', 'veroeffentlicht'));
