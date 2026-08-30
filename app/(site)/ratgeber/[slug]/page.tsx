import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { oeffentlicherArtikel } from "@/lib/oeffentlich";
import { renderMarkdown } from "@/lib/markdown";

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

  const { artikel, tools } = daten;
  const html = renderMarkdown(artikel.content_md, { artikelSlug: artikel.slug });

  return (
    <article className="article">
      <div className="wrap">
        <div className="article-head">
          {artikel.kategorie_name && (
            <span className="mono">
              {artikel.kategorie_slug ? (
                <Link href={`/themen/${artikel.kategorie_slug}`}>
                  {artikel.kategorie_name}
                </Link>
              ) : (
                artikel.kategorie_name
              )}
            </span>
          )}
          <h1>{artikel.title}</h1>
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
                  href={`/go/${tool.short_code}?a=${artikel.slug}`}
                  rel="sponsored nofollow"
                >
                  Zum Anbieter
                </a>
              </div>
            ))}
          </div>
        )}

        <p className="disclosure">
          Mit „Zum Anbieter“ markierte Links sind Affiliate-Links. Buchst du
          darüber, erhalten wir eine Provision. Für dich ändert sich am Preis
          nichts.
        </p>
      </div>
    </article>
  );
}
