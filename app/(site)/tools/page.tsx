import type { Metadata } from "next";
import { toolsFuerSeite, type ToolDetail } from "@/lib/oeffentlich";
import { AffiliateHinweis } from "@/components/oeffentlich/AffiliateHinweis";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Die Tools für den Start in die Selbstständigkeit, ausführlich vorgestellt und nach Thema sortiert: Geschäftskonto, Buchhaltung, Website, Social Media und mehr.",
  alternates: { canonical: "/tools" },
};

type Unter = { name: string; slug: string; tools: ToolDetail[] };
type Ober = { name: string; slug: string | null; unter: Unter[] };

function gruppieren(tools: ToolDetail[]): Ober[] {
  const ober = new Map<string, Ober>();
  for (const t of tools) {
    const oberKey = t.oberkategorie_slug ?? t.kategorie_slug;
    const oberName = t.oberkategorie_name ?? t.kategorie_name;
    if (!ober.has(oberKey)) {
      ober.set(oberKey, {
        name: oberName,
        slug: t.oberkategorie_slug,
        unter: [],
      });
    }
    const o = ober.get(oberKey)!;
    let u = o.unter.find((x) => x.slug === t.kategorie_slug);
    if (!u) {
      u = { name: t.kategorie_name, slug: t.kategorie_slug, tools: [] };
      o.unter.push(u);
    }
    u.tools.push(t);
  }
  return [...ober.values()];
}

function ToolKarte({ tool }: { tool: ToolDetail }) {
  return (
    <article className="tool-karte" id={tool.slug}>
      <div className="tool-karte-kopf">
        <h4>{tool.name}</h4>
        {tool.preis_stand && (
          <span className="tool-stand mono">{tool.preis_stand}</span>
        )}
      </div>
      {tool.short_description && (
        <p className="tool-tagline">{tool.short_description}</p>
      )}
      {tool.beschreibung && <p className="tool-text">{tool.beschreibung}</p>}

      {tool.preise.length > 0 && (
        <table className="tool-preise">
          <tbody>
            {tool.preise.map((p) => (
              <tr key={p.tier}>
                <th>{p.tier}</th>
                <td>{p.price}</td>
                <td>{p.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tool.fuer_wen.length > 0 && (
        <div className="tool-fuerwen">
          <span className="mono">Passt, wenn du …</span>
          <ul>
            {tool.fuer_wen.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      {tool.affiliate_url ? (
        <a
          className="btn-primary tool-cta"
          href={`/go/${tool.short_code}`}
          rel="sponsored nofollow"
        >
          Zum Anbieter <span className="aff-stern">*</span>
        </a>
      ) : (
        tool.homepage_url && (
          <a
            className="btn-secondary tool-cta"
            href={tool.homepage_url}
            rel="nofollow noopener"
            target="_blank"
          >
            Zur Anbieter-Seite
          </a>
        )
      )}
    </article>
  );
}

export default async function ToolsSeite() {
  const tools = await toolsFuerSeite();
  const gruppen = gruppieren(tools);
  const hatAffiliate = tools.some((t) => t.affiliate_url);

  return (
    <section className="article">
      <div className="wrap">
        <div className="section-head" style={{ marginBottom: 20 }}>
          <span className="mono">Tools</span>
          <h2>Tools für den Start</h2>
        </div>
        <p className="tools-intro">
          Die Tools, die ich selbst nutze oder ernsthaft geprüft habe, hier
          ausführlicher als in den einzelnen Guides. Ein Teil der Links ist ein
          Affiliate-Link.
        </p>

        {gruppen.length === 0 ? (
          <p style={{ color: "var(--ink-soft)" }}>
            Die Tool-Übersicht wird gerade aufgebaut.
          </p>
        ) : (
          gruppen.map((o) => (
            <div key={o.slug ?? o.name} className="tools-ober">
              <h3>{o.name}</h3>
              {o.unter.map((u) => (
                <div key={u.slug} className="tools-unter">
                  {u.name !== o.name && (
                    <span className="mono tools-unter-titel">{u.name}</span>
                  )}
                  {u.tools.map((t) => (
                    <ToolKarte key={t.slug} tool={t} />
                  ))}
                </div>
              ))}
            </div>
          ))
        )}

        {hatAffiliate && <AffiliateHinweis breit />}
      </div>
    </section>
  );
}
