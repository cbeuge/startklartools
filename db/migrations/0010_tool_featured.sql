-- Hauptempfehlung: ein bis zwei Tools stehen auf /tools ganz oben, über den
-- nach Kategorie filterbaren Rest. Im Admin pro Tool ein Haken.
ALTER TABLE tools ADD COLUMN featured BOOLEAN NOT NULL DEFAULT false;

UPDATE tools SET featured = true WHERE short_code = 'qonto';
