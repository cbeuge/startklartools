-- Ausführlichere Tool-Angaben für die /tools-Seite (mehr als die kurze
-- Erwähnung im Artikel).
ALTER TABLE tools
  ADD COLUMN beschreibung TEXT NOT NULL DEFAULT '',
  ADD COLUMN preise       JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN fuer_wen     JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN preis_stand  TEXT NOT NULL DEFAULT '';

-- Tool-Unterkategorien unter den vorhandenen Hauptkategorien. Sie tauchen
-- nicht auf der Landingpage/im Footer auf (dort nur parent_id IS NULL),
-- gruppieren aber die /tools-Seite.
INSERT INTO categories (slug, name, parent_id, status, sort_order)
SELECT v.slug, v.name, p.id, 'veroeffentlicht', v.ord
  FROM (VALUES
    ('geschaeftskonto',        'Geschäftskonto',           'finanzen',        10),
    ('buchhaltung-rechnungen', 'Buchhaltung & Rechnungen', 'finanzen',        11),
    ('website-baukasten',      'Website & Baukasten',      'kunden-gewinnen', 10),
    ('social-media',           'Social Media',             'kunden-gewinnen', 11),
    ('crm-kontakte',           'CRM & Kontakte',           'kunden-gewinnen', 12),
    ('auftraege-finden',       'Aufträge finden',          'kunden-gewinnen', 13),
    ('projekte-zeit',          'Projekte & Zeit',          'organisation',    10)
  ) AS v(slug, name, parent_slug, ord)
  JOIN categories p ON p.slug = v.parent_slug
ON CONFLICT (slug) DO NOTHING;
