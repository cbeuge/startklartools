import { notFound } from "next/navigation";
import { tool } from "@/lib/tools";
import { alleKategorien } from "@/lib/kategorien";
import { ToolFormular } from "@/components/admin/ToolFormular";
import { toolLoeschen } from "../actions";

export default async function ToolBearbeiten({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gespeichert?: string }>;
}) {
  const { id } = await params;
  const toolId = Number(id);
  if (!Number.isInteger(toolId)) notFound();

  const [t, kategorien] = await Promise.all([
    tool(toolId),
    alleKategorien(),
  ]);
  if (!t) notFound();

  const { gespeichert } = await searchParams;
  const basisUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tool bearbeiten</h1>
        <form action={toolLoeschen}>
          <input type="hidden" name="id" value={t.id} />
          <button
            type="submit"
            className="text-sm text-slate-500 hover:text-red-600"
          >
            Tool löschen
          </button>
        </form>
      </div>

      {gespeichert && (
        <p className="mt-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Gespeichert.
        </p>
      )}

      <div className="mt-4 space-y-1 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        <p>
          Im Artikel verlinken:{" "}
          <span className="font-mono">[Anzeigetext](/go/{t.short_code})</span>
          {" "}– die Zuordnung zum Artikel passiert automatisch.
        </p>
        <p>
          Direktlink (z.&nbsp;B. Newsletter, Social):{" "}
          <span className="font-mono">
            {basisUrl}/go/{t.short_code}
          </span>
        </p>
      </div>

      <div className="mt-6">
        <ToolFormular
          kategorien={kategorien}
          initial={{
            id: t.id,
            slug: t.slug,
            name: t.name,
            short_description: t.short_description,
            affiliate_url: t.affiliate_url,
            short_code: t.short_code,
            category_id: t.category_id,
            status: t.status,
            logo_url: t.logo_url,
            commission_info: t.commission_info,
            notes: t.notes,
          }}
        />
      </div>
    </div>
  );
}
