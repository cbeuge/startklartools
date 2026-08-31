import { alleKategorien } from "@/lib/kategorien";
import { toolsFuerAuswahl } from "@/lib/tools";
import { artikelFuerAuswahl } from "@/lib/artikel";
import { ArtikelFormular } from "@/components/admin/ArtikelFormular";

export default async function NeuerArtikel() {
  const [kategorien, tools, artikelAuswahl] = await Promise.all([
    alleKategorien(),
    toolsFuerAuswahl(),
    artikelFuerAuswahl(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Neuer Artikel</h1>
      <div className="mt-6">
        <ArtikelFormular
          kategorien={kategorien}
          tools={tools}
          artikel={artikelAuswahl}
          initial={{
            id: null,
            slug: "",
            title: "",
            excerpt: "",
            content_md: "",
            category_id: null,
            status: "entwurf",
            meta_title: "",
            meta_description: "",
            hero_image_url: "",
            toolIds: [],
            relatedIds: [],
          }}
        />
      </div>
    </div>
  );
}
