import Link from "next/link";
import {
  themenKategorien,
  neuesteGuides,
  veroeffentlichteTools,
  kuerzel,
  type ToolLink,
} from "@/lib/oeffentlich";

// Dynamisch rendern: die Seite spiegelt sofort wider, was im Admin
// veröffentlicht wird. Die paar Postgres-Abfragen sind vernachlässigbar.
export const dynamic = "force-dynamic";

function toolsNachKategorie(tools: ToolLink[]) {
  const gruppen = new Map<
    string,
    { name: string; slug: string | null; tools: ToolLink[] }
  >();
  for (const t of tools) {
    const key = t.kategorie_slug ?? "_ohne";
    if (!gruppen.has(key)) {
      gruppen.set(key, {
        name: t.kategorie_name ?? "Weitere",
        slug: t.kategorie_slug,
        tools: [],
      });
    }
    gruppen.get(key)!.tools.push(t);
  }
  return [...gruppen.values()].slice(0, 4);
}

export default async function Startseite() {
  const [themen, guides, tools] = await Promise.all([
    themenKategorien(),
    neuesteGuides(3),
    veroeffentlichteTools(),
  ]);
  const toolGruppen = toolsNachKategorie(tools);

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow mono">Für Kleingewerbe &amp; Freiberufler</div>
            <h1>Startklar für die Selbstständigkeit.</h1>
            <p className="lead">
              Ehrliche Guides für jeden Schritt in die Selbstständigkeit — und
              die Tools, die dabei wirklich helfen.
            </p>
            <div className="btnrow">
              <Link href="/#guides" className="btn-primary">
                Guides durchstöbern
              </Link>
              <Link href="/#tools" className="btn-secondary">
                Tools ansehen
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="form-card">
              <div className="fc-head">
                <div className="fc-title">Erste 90 Tage</div>
                <div className="mono">Az. GR-001</div>
              </div>
              <div className="fc-item">
                <div className="fc-check">✓</div>
                <div className="fc-text">
                  <div className="fc-t1">Kleingewerbe angemeldet</div>
                  <div className="fc-t2">Beim Gewerbeamt erledigt</div>
                </div>
              </div>
              <div className="fc-item">
                <div className="fc-check">✓</div>
                <div className="fc-text">
                  <div className="fc-t1">Geschäftskonto eröffnet</div>
                  <div className="fc-t2">In 15 Minuten</div>
                </div>
              </div>
              <div className="fc-item">
                <div className="fc-check pending">·</div>
                <div className="fc-text">
                  <div className="fc-t1">Buchhaltung eingerichtet</div>
                  <div className="fc-t2">Nächster Schritt</div>
                </div>
              </div>
            </div>
            <div className="stamp-mark">
              <span>
                STARTKLAR
                <br />
                GEPRÜFT
              </span>
            </div>
          </div>
        </div>
      </section>

      {themen.length > 0 && (
        <section id="themen">
          <div className="wrap">
            <div className="section-head">
              <span className="mono">Themen</span>
              <h2>Fang da an, wo du gerade stehst</h2>
            </div>
            <div className="themen-grid">
              {themen.map((t) => (
                <Link
                  key={t.id}
                  className="theme-card"
                  href={`/themen/${t.slug}`}
                >
                  <div className="code">{kuerzel(t.name)}</div>
                  <div>
                    <h3>{t.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {guides.length > 0 && (
        <section id="guides">
          <div className="wrap">
            <div className="section-head">
              <span className="mono">Guides</span>
              <h2>Zuletzt veröffentlicht</h2>
            </div>
            <div className="guides-grid">
              {guides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/ratgeber/${g.slug}`}
                  className="guide-card"
                >
                  {g.kategorie_name && (
                    <div className="guide-tag">{g.kategorie_name}</div>
                  )}
                  <h3>{g.title}</h3>
                  {g.excerpt && <p>{g.excerpt}</p>}
                  <span className="guide-more">Guide lesen →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {toolGruppen.length > 0 && (
        <section id="tools">
          <div className="wrap">
            <div className="section-head">
              <span className="mono">Tools</span>
              <h2>Empfohlen nach Kategorie</h2>
            </div>
            <div className="tools-grid">
              {toolGruppen.map((gruppe) => (
                <div className="tool-cat" key={gruppe.name}>
                  <h3>{gruppe.name}</h3>
                  <ul>
                    {gruppe.tools.slice(0, 4).map((tool) => (
                      <li key={tool.short_code}>
                        <a href={`/go/${tool.short_code}`} rel="sponsored nofollow">
                          {tool.name} <span className="arr">→</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  {gruppe.slug && (
                    <Link className="tool-cat-link" href={`/themen/${gruppe.slug}`}>
                      Alle ansehen
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="trust">
        <div className="wrap trust-inner">
          <div className="trust-badge">1P</div>
          <div>
            <p>
              „Ich baue Websites und Tools für Selbstständige seit Jahren —
              startklar.tools ist die Seite, die ich mir am Anfang selbst
              gewünscht hätte.“
            </p>
            <div className="trust-name">
              — Gründer von startklar.tools, selbst nebenberuflich unterwegs
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
