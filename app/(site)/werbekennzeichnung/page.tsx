import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Werbekennzeichnung",
  description:
    "Wie startklar.tools Affiliate-Links kennzeichnet und was das für dich bedeutet.",
  alternates: { canonical: "/werbekennzeichnung" },
};

export default function Werbekennzeichnung() {
  return (
    <section>
      <div className="wrap legal">
        <h1>Werbekennzeichnung</h1>

        <p>
          Auf startklar.tools findest du <strong>Affiliate-Links</strong> (auch
          Partner-, Provisions- oder Werbelinks genannt). Sie sind mit einem{" "}
          <span className="aff-stern">*</span> gekennzeichnet oder tragen eine
          Beschriftung wie „Zum Anbieter“.
        </p>

        <h2>Was bedeutet das?</h2>
        <p>
          Klickst du auf einen solchen Link und schließt beim Anbieter etwas ab
          (zum Beispiel ein Konto eröffnen oder ein Abo buchen), erhalten wir
          dafür eine Provision. <strong>Für dich ändert sich am Preis nichts</strong>
          {" "}
          und es entstehen keine zusätzlichen Kosten.
        </p>

        <h2>Beeinflusst das die Empfehlungen?</h2>
        <p>
          Nein. Wir nehmen ein Tool in einen Guide auf, weil wir es für den
          Start in die Selbstständigkeit für sinnvoll halten. Ob es ein
          Partnerprogramm gibt und wie hoch eine Provision ausfällt, spielt für
          die Auswahl und die Bewertung keine Rolle. Wo es sinnvoll ist, nennen
          wir auch Alternativen ohne Affiliate-Link.
        </p>

        <h2>Warum überhaupt Affiliate-Links?</h2>
        <p>
          Die Provisionen finanzieren die Arbeit an den Guides. Die Alternative
          wären Anzeigen oder eine Bezahlschranke. So bleiben die Inhalte frei
          zugänglich.
        </p>
      </div>
    </section>
  );
}
