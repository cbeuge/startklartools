import type { Metadata } from "next";
import { rechtstext } from "@/lib/legalhub";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Datenschutz",
  alternates: { canonical: "/datenschutz" },
};

export default async function DatenschutzSeite() {
  const html = await rechtstext("datenschutz");

  return (
    <section>
      <div className="wrap legal">
        <h1>Datenschutz</h1>
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p style={{ color: "var(--ink-soft)" }}>
            Die Datenschutzerklärung wird gerade eingerichtet.
          </p>
        )}
      </div>
    </section>
  );
}
