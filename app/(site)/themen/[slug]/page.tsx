import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { oeffentlicheKategorie, toolZiel } from "@/lib/oeffentlich";
import { AffiliateHinweis } from "@/components/oeffentlich/AffiliateHinweis";

export const dynamic = "force-dynamic";

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
  const hatAffiliate = tools.some((t) => t.affiliate_url);

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
              {tools.map((tool) => {
                const ziel = toolZiel(tool);
                return (
                  <div className="tool-row" key={tool.short_code}>
                    <div>
                      <div className="tr-name">
                        {tool.name}
                        {ziel.affiliate && (
                          <>
                            {" "}
                            <span className="aff-stern">*</span>
                          </>
                        )}
                      </div>
                      {tool.short_description && (
                        <div className="tr-desc">{tool.short_description}</div>
                      )}
                    </div>
                    {ziel.href && (
                      <a
                        className="btn-primary"
                        href={ziel.href}
                        rel={
                          ziel.affiliate
                            ? "sponsored nofollow"
                            : "nofollow noopener"
                        }
                        {...(ziel.affiliate ? {} : { target: "_blank" })}
                      >
                        Zum Anbieter
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
            {hatAffiliate && <AffiliateHinweis breit />}
          </div>
        )}
      </div>
    </section>
  );
}
