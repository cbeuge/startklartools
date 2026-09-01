import Link from "next/link";
import { MobileMenu } from "./MobileMenu";

export function SeitenKopf() {
  return (
    <header className="site-header">
      <div className="wrap nav">
        <Link href="/" className="logo">
          startklar<span className="dot">.</span>tools
        </Link>
        <nav className="navlinks">
          <Link href="/#themen">Themen</Link>
          <Link href="/tools">Tools</Link>
          <Link href="/ratgeber">Guides</Link>
        </nav>
        <div className="nav-right">
          <Link href="/#themen" className="nav-cta">
            Loslegen
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
