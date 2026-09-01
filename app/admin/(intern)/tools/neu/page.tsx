import { alleKategorien } from "@/lib/kategorien";
import { ToolFormular } from "@/components/admin/ToolFormular";

export default async function NeuesTool() {
  const kategorien = await alleKategorien();

  return (
    <div>
      <h1 className="text-2xl font-bold">Neues Tool</h1>
      <div className="mt-6">
        <ToolFormular
          kategorien={kategorien}
          initial={{
            id: null,
            slug: "",
            name: "",
            short_description: "",
            affiliate_url: "",
            short_code: "",
            category_id: null,
            status: "entwurf",
            logo_url: "",
            commission_info: "",
            notes: "",
            beschreibung: "",
            preis_stand: "",
            fuer_wen_text: "",
            preise_text: "",
          }}
        />
      </div>
    </div>
  );
}
