import type { MetadataRoute } from "next";
import {
  veroeffentlichteArtikelSlugs,
  themenKategorien,
} from "@/lib/oeffentlich";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const basis = process.env.NEXT_PUBLIC_BASE_URL ?? "https://startklar.tools";
  const [artikel, themen] = await Promise.all([
    veroeffentlichteArtikelSlugs(),
    themenKategorien(),
  ]);

  return [
    { url: `${basis}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${basis}/impressum`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${basis}/datenschutz`, changeFrequency: "yearly", priority: 0.1 },
    ...themen.map((t) => ({
      url: `${basis}/themen/${t.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...artikel.map((a) => ({
      url: `${basis}/ratgeber/${a.slug}`,
      lastModified: new Date(a.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
