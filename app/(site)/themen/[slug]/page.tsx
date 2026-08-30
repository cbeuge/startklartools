import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { oeffentlicheKategorie, alleKategorienSlugs } from "@/lib/oeffentlich";

export const revalidate = 300;

export async function generateStaticParams() {
  const rows = await alleKategorienSlugs();
  return rows.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const daten = await oeffentlicheKategorie(slug);
  if (!daten) return {};
  return {
    title: daten.kategorie.name,
    description: `Guides und Tools zum Thema ${daten.kategorie.name} für den Start in die Selbstständigkeit.`,
    alternates: { canonical: `/themen/${daten.kategorie.slug}` },
  };
}

export default async function ThemenSeite({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const daten = await oeffentlicheKategorie(slug);
  if (!daten) notFound();

  const { kategorie, artikel, tools } = daten;

  return (
    <section>
      <div className="wrap">
        <div className="section-head">
          <span className="mono">Thema</span>
          <h2>{kategorie.name}</h2>
        </div>

        {artikel.length > 0 ? (
          <ul className="list-links">
            {artikel.map((a) => (
              <li key={a.slug}>
                <Link href={`/ratgeber/${a.slug}`}>
                  <div className="ll-title">{a.title}</div>
                  {a.excerpt && <div className="ll-desc">{a.excerpt}</div>}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "var(--ink-soft)" }}>
            Hier entstehen gerade Guides.
          </p>
        )}

        {tools.length > 0 && (
          <div style={{ marginTop: 56 }}>
            <div className="section-head">
              <span className="mono">Tools</span>
              <h2>Empfohlen für {kategorie.name}</h2>
            </div>
            <div className="tool-box" style={{ margin: 0, maxWidth: "none" }}>
              {tools.map((tool) => (
                <div className="tool-row" key={tool.short_code}>
                  <div>
                    <div className="tr-name">{tool.name}</div>
                    {tool.short_description && (
                      <div className="tr-desc">{tool.short_description}</div>
                    )}
                  </div>
                  <a
                    className="btn-primary"
                    href={`/go/${tool.short_code}`}
                    rel="sponsored nofollow"
                  >
                    Zum Anbieter
                  </a>
                </div>
              ))}
            </div>
            <p className="disclosure" style={{ maxWidth: "none" }}>
              Mit „Zum Anbieter“ markierte Links sind Affiliate-Links.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
