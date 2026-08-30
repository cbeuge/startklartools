import "./site.css";
import { zilla, source, mono } from "./fonts";
import { SeitenKopf } from "@/components/oeffentlich/SeitenKopf";
import { SeitenFuss } from "@/components/oeffentlich/SeitenFuss";
import { themenKategorien } from "@/lib/oeffentlich";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themen = await themenKategorien();

  return (
    <div
      className={`site-shell ${zilla.variable} ${source.variable} ${mono.variable}`}
    >
      <SeitenKopf />
      {children}
      <SeitenFuss themen={themen} />
    </div>
  );
}
