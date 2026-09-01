"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/#themen", label: "Themen" },
  { href: "/tools", label: "Tools" },
  { href: "/ratgeber", label: "Guides" },
];

export function MobileMenu() {
  const [offen, setOffen] = useState(false);

  useEffect(() => {
    if (!offen) return;
    const schliessen = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOffen(false);
    };
    window.addEventListener("keydown", schliessen);
    return () => window.removeEventListener("keydown", schliessen);
  }, [offen]);

  return (
    <div className="mobile-menu">
      <button
        type="button"
        className="burger"
        aria-label={offen ? "Menü schließen" : "Menü öffnen"}
        aria-expanded={offen}
        onClick={() => setOffen((o) => !o)}
      >
        <span className={offen ? "burger-icon offen" : "burger-icon"} />
      </button>
      {offen && (
        <>
          <div
            className="mobile-overlay"
            onClick={() => setOffen(false)}
            aria-hidden="true"
          />
          <nav className="mobile-panel">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOffen(false)}>
                {l.label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
