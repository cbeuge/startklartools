import type { Metadata } from "next";
import { rechtstext } from "@/lib/legalhub";

export const revalidate = 3600;

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
