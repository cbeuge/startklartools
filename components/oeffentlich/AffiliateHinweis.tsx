import Link from "next/link";

// Einheitliche Werbekennzeichnung. Ueberall dort einsetzen, wo Affiliate-Links
// auf der Seite stehen (Artikel, Themenseite, Tool-Kaesten, Startseite).
export function AffiliateHinweis({ breit = false }: { breit?: boolean }) {
  return (
    <p
      className="disclosure"
      style={breit ? { maxWidth: "none" } : undefined}
    >
      <span className="aff-stern">*</span> Affiliate-Link. Klickst du darauf und
      schließt beim Anbieter etwas ab, erhalten wir eine Provision. Für dich
      ändert sich am Preis nichts.{" "}
      <Link
        href="/werbekennzeichnung"
        style={{ borderBottom: "1px solid var(--stamp)" }}
      >
        Mehr dazu
      </Link>
    </p>
  );
}
