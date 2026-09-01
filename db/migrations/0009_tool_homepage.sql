-- Offizielle Anbieter-Seite. Fällt ein, solange es keinen Affiliate-Link
-- gibt: /go/<code> leitet dann dorthin weiter, der Link-Austausch später
-- ändert nur affiliate_url.
ALTER TABLE tools ADD COLUMN homepage_url TEXT NOT NULL DEFAULT '';
