import type { Metadata } from "next";
import { rechtstext } from "@/lib/legalhub";

// Dynamisch: der Text kommt aus LegalHub und wird dort im Dateicache neben der
// App 24 h vorgehalten (siehe lib/legalhub.ts). Mit ISR würde eine Textänderung
// zusätzlich bis zu eine Stunde im Next-Cache festhängen.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Impressum",
  alternates: { canonical: "/impressum" },
};

export default async function ImpressumSeite() {
  const html = await rechtstext("impressum");

  return (
    <section>
      <div className="wrap legal">
        <h1>Impressum</h1>
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p style={{ color: "var(--ink-soft)" }}>
            Das Impressum wird gerade eingerichtet.
          </p>
        )}
      </div>
    </section>
  );
}
