import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = { robots: { index: false } };

export default async function InternLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <>
      <AdminNav email={admin.email} />
      <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
    </>
  );
}
