"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Übersicht" },
  { href: "/admin/artikel", label: "Artikel" },
  { href: "/admin/tools", label: "Tools" },
  { href: "/admin/kategorien", label: "Kategorien" },
  { href: "/admin/klicks", label: "Klicks" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/konto", label: "Konto" },
] as const;

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-5 py-3">
        <span className="font-bold">
          startklar<span className="text-akzent">.tools</span>
        </span>
        <nav className="flex gap-4 text-sm">
          {LINKS.map((l) => {
            const active =
              l.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={active ? "font-medium text-marke" : "text-slate-600"}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <form action="/admin/logout" method="post" className="ml-auto">
          <span className="mr-3 text-xs text-slate-400">{email}</span>
          <button type="submit" className="text-sm text-slate-600 hover:text-red-600">
            Abmelden
          </button>
        </form>
      </div>
    </header>
  );
}
