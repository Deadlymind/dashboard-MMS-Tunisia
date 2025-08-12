import ThemeToggle from "@/components/ThemeToggle";
export default function Page(){
  return(<main className="p-6"><div className="card"><h1 className="text-2xl font-semibold">Tableau de bord</h1><p className="text-sm text-[var(--muted)]">Bienvenue</p><div className="mt-4"><ThemeToggle/></div></div></main>);
}
