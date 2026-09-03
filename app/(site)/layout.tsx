import "./site.css";
import { zilla, source, mono } from "./fonts";
import { SeitenKopf } from "@/components/oeffentlich/SeitenKopf";
import { SeitenFuss } from "@/components/oeffentlich/SeitenFuss";
import { themenKategorien } from "@/lib/oeffentlich";
import { aktiveMetaTags } from "@/lib/meta-tags";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [themen, metaTags] = await Promise.all([
    themenKategorien(),
    aktiveMetaTags(),
  ]);

  return (
    <div
      className={`site-shell ${zilla.variable} ${source.variable} ${mono.variable}`}
    >
      {/* Verifizierungs-Tags der Affiliate-Netzwerke, gepflegt unter
          /admin/einstellungen. React hebt sie in den <head>. Bewusst als
          rohes Element statt ueber die Metadata-API: die kann nur content=,
          Impact und damit N26 liest aber value=. */}
      {metaTags.map((t) => (
        <meta key={t.id} name={t.name} {...{ [t.attribut]: t.wert }} />
      ))}
      <SeitenKopf />
      {children}
      <SeitenFuss themen={themen} />
    </div>
  );
}
