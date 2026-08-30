import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { anmelden } from "./actions";

export const metadata: Metadata = { title: "Anmelden", robots: { index: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ fehler?: string }>;
}) {
  if (await getAdmin()) redirect("/admin");
  const { fehler } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-xl font-bold">startklar.tools Admin</h1>
      <form action={anmelden} className="mt-6 space-y-4">
        {fehler && (
          <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            E-Mail oder Passwort stimmt nicht.
          </p>
        )}
        <div>
          <label htmlFor="email" className="block text-sm text-slate-600">
            E-Mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="passwort" className="block text-sm text-slate-600">
            Passwort
          </label>
          <input
            id="passwort"
            name="passwort"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-marke px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Anmelden
        </button>
      </form>
    </main>
  );
}
