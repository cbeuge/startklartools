-- Icon-Zuordnung pro Kategorie. Der Wert ist ein Schlüssel aus der
-- Icon-Bibliothek (lib/kategorie-icons.ts), leer = kein Icon (dann Kürzel).
ALTER TABLE categories ADD COLUMN icon TEXT NOT NULL DEFAULT '';

-- Vorhandene Kategorien zuordnen (deckt Prod- und lokale Slugs ab).
UPDATE categories SET icon = 'spross'      WHERE slug = 'gruendung';
UPDATE categories SET icon = 'euro'        WHERE slug IN ('finanzen', 'finanzen-buchhaltung');
UPDATE categories SET icon = 'sprechblase' WHERE slug = 'kunden-gewinnen';
UPDATE categories SET icon = 'checkliste'  WHERE slug = 'organisation';
UPDATE categories SET icon = 'waage'       WHERE slug = 'rechtliches';
