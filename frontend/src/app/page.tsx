import AppShell from "@/components/AppShell";
import Link from "next/link";

export default function HomePage() {
  return (
    <AppShell>
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold">Accueil</h1>
        <p className="text-sm text-[var(--muted)]">
          Bienvenue. Utilisez la barre latérale pour naviguer.
        </p>
        <div className="flex gap-3">
          <Link className="btn btn-primary" href="/exploitation/structure/clients">Aller aux clients</Link>
          <Link className="btn" href="/exploitation/structure/clients/nouveau">Nouveau client</Link>
        </div>
      </section>
    </AppShell>
  );
}
