-- Artikel-Titelbild und zusaetzliche Tool-Felder.

ALTER TABLE articles
  ADD COLUMN hero_image_url TEXT NOT NULL DEFAULT '';

ALTER TABLE tools
  ADD COLUMN logo_url        TEXT NOT NULL DEFAULT '',
  -- Provisionshoehe, z.B. "30 % wiederkehrend" oder "50 EUR pro Abschluss".
  -- Nur intern im Admin, nicht oeffentlich.
  ADD COLUMN commission_info TEXT NOT NULL DEFAULT '',
  -- Freie interne Notizen zum Partnerprogramm (Bedingungen, Ansprechpartner,
  -- Cookie-Laufzeit ...). Nur intern.
  ADD COLUMN notes           TEXT NOT NULL DEFAULT '';
