import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { oeffentlicherArtikel, kategorieIcon, toolZiel } from "@/lib/oeffentlich";
import { renderMarkdown } from "@/lib/markdown";
import { AffiliateHinweis } from "@/components/oeffentlich/AffiliateHinweis";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const daten = await oeffentlicherArtikel(slug);
  if (!daten) return {};
  const { artikel } = daten;
  return {
    title: artikel.meta_title || artikel.title,
    description: artikel.meta_description || artikel.excerpt || undefined,
    alternates: { canonical: `/ratgeber/${artikel.slug}` },
    openGraph: {
      title: artikel.meta_title || artikel.title,
      description: artikel.meta_description || artikel.excerpt || undefined,
      images: artikel.hero_image_url ? [artikel.hero_image_url] : undefined,
      type: "article",
    },
  };
}

export default async function ArtikelSeite({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const daten = await oeffentlicherArtikel(slug);
  if (!daten) notFound();

  const { artikel, tools, goZiele, verwandt } = daten;
  const html = renderMarkdown(artikel.content_md, {
    artikelSlug: artikel.slug,
    goZiele,
  });
  const icon = kategorieIcon(artikel.kategorie_icon);
  const hatAffiliate =
    tools.some((t) => t.affiliate_url) || html.includes('href="/go/');

  return (
    <article className="article">
      <div className="wrap">
        <div className="article-head">
          <h1>{artikel.title}</h1>
          <div className="article-meta mono">
            {icon && (
              <span
                className="article-meta-icon"
                dangerouslySetInnerHTML={{ __html: icon }}
              />
            )}
            <span className="article-meta-text">
              {artikel.kategorie_name && (
                <>
                  {artikel.kategorie_slug ? (
                    <Link href={`/themen/${artikel.kategorie_slug}`}>
                      {artikel.kategorie_name}
                    </Link>
                  ) : (
                    artikel.kategorie_name
                  )}
                  {" · "}
                </>
              )}
              {artikel.lesezeit_min} Min. Lesezeit
            </span>
          </div>
        </div>

        {artikel.hero_image_url && (
          <div className="article-hero">
            <img src={artikel.hero_image_url} alt="" loading="lazy" />
          </div>
        )}

        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {tools.length > 0 && (
          <div className="tool-box">
            <span className="mono">Im Artikel empfohlen</span>
            {tools.map((tool) => {
              const ziel = toolZiel(tool, artikel.slug);
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
        )}

        {hatAffiliate && <AffiliateHinweis />}

        {verwandt.length > 0 && (
          <aside className="weiterlesen">
            <span className="mono">Passt dazu</span>
            <ul className="list-links">
              {verwandt.map((v) => (
                <li key={v.slug}>
                  <Link href={`/ratgeber/${v.slug}`}>
                    <div className="ll-title">{v.title}</div>
                    {v.kategorie_name && (
                      <div className="ll-desc">{v.kategorie_name}</div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </article>
  );
}
