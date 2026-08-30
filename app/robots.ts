import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const basis = process.env.NEXT_PUBLIC_BASE_URL ?? "https://startklar.tools";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/go/", "/newsletter/"],
    },
    sitemap: `${basis}/sitemap.xml`,
  };
}
