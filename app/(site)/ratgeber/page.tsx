import type { Metadata } from "next";
import Link from "next/link";
import {
  guidesUebersicht,
  themenKategorien,
  kuerzel,
  kategorieIcon,
  datum,
  type GuideKarte,
} from "@/lib/oeffentlich";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Alle Guides für den Start in die Selbstständigkeit – nach Thema sortiert.",
  alternates: { canonical: "/ratgeber" },
};

function Medien({ guide }: { guide: GuideKarte }) {
  if (guide.hero_image_url) {
    return (
      <div className="g-media">
        <img src={guide.hero_image_url} alt="" loading="lazy" />
      </div>
    );
  }
  const icon = guide.kategorie_slug ? kategorieIcon(guide.kategorie_slug) : null;
  return (
    <div className="g-media-leer">
      {icon ? (
        <span className="g-icon" dangerouslySetInnerHTML={{ __html: icon }} />
      ) : (
        <span>{guide.kategorie_name ? kuerzel(guide.kategorie_name) : "ST"}</span>
      )}
    </div>
  );
}

function Meta({ guide }: { guide: GuideKarte }) {
  return (
    <div className="g-meta mono">
      {guide.kategorie_name ? `${guide.kategorie_name} · ` : ""}
      {guide.lesezeit_min} Min. Lesezeit
    </div>
  );
}

export default async function GuideUebersicht({
  searchParams,
}: {
  searchParams: Promise<{ kategorie?: string }>;
}) {
  const { kategorie } = await searchParams;
  const [guides, kategorien] = await Promise.all([
    guidesUebersicht(kategorie),
    themenKategorien(),
  ]);

  const aktiv = kategorie ?? "";
  const oben = guides.slice(0, 2);
  const rest = guides.slice(2);

  return (
    <section className="article">
      <div className="wrap">
        <div className="section-head" style={{ marginBottom: 28 }}>
          <span className="mono">Guides</span>
          <h2>Guides für den Start</h2>
        </div>

        {guides.length === 0 ? (
          <p style={{ color: "var(--ink-soft)" }}>
            {aktiv
              ? "In diesem Thema gibt es noch keine Guides."
              : "Hier entstehen gerade die ersten Guides."}
          </p>
        ) : (
          <>
            {oben.length > 0 && (
              <div className="g-featured">
                {oben.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/ratgeber/${g.slug}`}
                    className="g-card g-card-gross"
                  >
                    <Medien guide={g} />
                    <Meta guide={g} />
                    <h3>{g.title}</h3>
                    {g.excerpt && <p>{g.excerpt}</p>}
                    <span className="g-date mono">{datum(g.published_at)}</span>
                  </Link>
                ))}
              </div>
            )}

            <div className="g-filter">
              <Link
                href="/ratgeber"
                className={aktiv === "" ? "g-pill g-pill-aktiv" : "g-pill"}
              >
                Alle
              </Link>
              {kategorien.map((k) => (
                <Link
                  key={k.id}
                  href={`/ratgeber?kategorie=${k.slug}`}
                  className={
                    aktiv === k.slug ? "g-pill g-pill-aktiv" : "g-pill"
                  }
                >
                  {k.name}
                </Link>
              ))}
            </div>

            {rest.length > 0 && (
              <div className="g-grid">
                {rest.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/ratgeber/${g.slug}`}
                    className="g-card"
                  >
                    <Medien guide={g} />
                    <Meta guide={g} />
                    <h3>{g.title}</h3>
                    <span className="g-date mono">{datum(g.published_at)}</span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
