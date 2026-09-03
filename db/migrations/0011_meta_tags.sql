-- Verifizierungs-Tags der Affiliate-Netzwerke.
--
-- Jedes Netzwerk will beim Antrag beweisen, dass die Seite wirklich uns
-- gehört, und legt dafür einen eigenen <meta>-Tag in den Kopf. Das wird mit
-- jedem weiteren Partnerprogramm mehr, deshalb pflegbar im Admin statt fest
-- im Code.
--
-- attribut ist bewusst frei: die meisten Netzwerke lesen content=, Impact
-- (und damit N26) liest value=. Wer das falsche Attribut ausliefert, fällt
-- durch die Prüfung, obwohl der Code stimmt.
CREATE TABLE meta_tags (
  id         SERIAL PRIMARY KEY,
  notiz      TEXT NOT NULL DEFAULT '',
  name       TEXT NOT NULL,
  attribut   TEXT NOT NULL DEFAULT 'content'
    CHECK (attribut IN ('content', 'value')),
  wert       TEXT NOT NULL,
  aktiv      BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO meta_tags (notiz, name, attribut, wert) VALUES
  ('N26 (über Impact)', 'impact-site-verification', 'value',
   '9e73f6c9-c726-4d7d-b9b9-82ba7db89055');
