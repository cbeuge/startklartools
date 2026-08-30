import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "startklar.tools – Werkzeuge für den Start in die Selbstständigkeit",
    template: "%s – startklar.tools",
  },
  description:
    "Handverlesene Tools für Kleingewerbe und Freiberufler: Geschäftskonten, Buchhaltung, CRM und mehr.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
