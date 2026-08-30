import Link from "next/link";
import type { OeffKategorie } from "@/lib/oeffentlich";
import { NewsletterFormular } from "./NewsletterFormular";

export function SeitenFuss({ themen }: { themen: OeffKategorie[] }) {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="logo" style={{ marginBottom: 14 }}>
              startklar<span className="dot">.</span>tools
            </div>
            <p
              style={{
                fontSize: 14,
                color: "var(--ink-soft)",
                maxWidth: 280,
              }}
            >
              Guides und Tools für den Start in die Selbstständigkeit — ohne
              Umwege.
            </p>
          </div>
          <div>
            <h4>Themen</h4>
            <ul>
              {themen.map((t) => (
                <li key={t.id}>
                  <Link href={`/themen/${t.slug}`}>{t.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Seite</h4>
            <ul>
              <li>
                <Link href="/#guides">Guides</Link>
              </li>
              <li>
                <Link href="/#tools">Tools</Link>
              </li>
              <li>
                <Link href="/impressum">Impressum</Link>
              </li>
              <li>
                <Link href="/datenschutz">Datenschutz</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Neu: Guide der Woche</h4>
            <NewsletterFormular />
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} startklar.tools</span>
          <span>Enthält Affiliate-Links</span>
        </div>
      </div>
    </footer>
  );
}
