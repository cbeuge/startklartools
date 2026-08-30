import { Zilla_Slab, Source_Sans_3, JetBrains_Mono } from "next/font/google";

// Selbst ausgeliefert (next/font laedt zur Bauzeit), daher keine Anfrage an
// Google und keine CSP-Ausnahme noetig.
export const zilla = Zilla_Slab({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-zilla",
  display: "swap",
});

export const source = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-source",
  display: "swap",
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});
