import { requireAdmin } from "@/lib/auth";
import { KontoFormular } from "@/components/admin/KontoFormular";

export default async function KontoSeite() {
  const admin = await requireAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold">Konto</h1>
      <p className="mt-1 text-sm text-slate-500">
        Angemeldet als {admin.email}
      </p>
      <div className="mt-6">
        <KontoFormular />
      </div>
    </div>
  );
}
