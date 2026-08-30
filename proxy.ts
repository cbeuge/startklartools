import { NextResponse, type NextRequest } from "next/server";

// In Next 16 heisst die Middleware proxy.ts.
// Schneller Riegel: wer kein Sitzungscookie hat, kommt gar nicht erst in den
// Admin. Die eigentliche Pruefung (Cookie gueltig, session_version, Konto
// existiert) macht das Admin-Layout gegen die Datenbank.
export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  if (!req.cookies.get("startklar_admin")) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
