"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  newsletterEintragen,
  type NewsletterState,
} from "@/app/(site)/newsletter/actions";

export function NewsletterFormular() {
  const [state, formAction, pending] = useActionState<NewsletterState, FormData>(
    newsletterEintragen,
    {},
  );

  return (
    <form action={formAction} className="newsletter">
      <input
        type="email"
        name="email"
        required
        placeholder="deine@email.de"
        aria-label="E-Mail-Adresse"
      />
      <button type="submit" disabled={pending}>
        {pending ? "…" : "Anmelden"}
      </button>
      {state.ok && (
        <p className="hinweis">Fast geschafft. Bestätige den Link in der E-Mail.</p>
      )}
      {state.error && (
        <p className="hinweis" style={{ color: "var(--stamp-dark)" }}>
          {state.error}
        </p>
      )}
      <p className="nl-consent">
        Du bekommst eine E-Mail zur Bestätigung. Abmeldung jederzeit,
        Details im <Link href="/datenschutz">Datenschutz</Link>.
      </p>
    </form>
  );
}
