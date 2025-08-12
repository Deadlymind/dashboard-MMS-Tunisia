"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const tabs = [
  ["informations","Informations"],
  ["objet-social","Objet Social"],
  ["agrements","Agréments"],
  ["associes","Associés"],
  ["rep-legal","Rep. légal"],
  ["employes","Employés"],
  ["doc-exoneration-tva","Doc. Exonération TVA"],
  ["acces-plateforme","Accès plateforme"],
  ["telechargements","Téléchargements"],
  ["modeles-imprimes","Modèles et Imprimés"],
  ["commissaire-aux-comptes","Commissaire aux comptes"],
  ["comptabilite","Comptabilité"],
] as const;

export default function ClientTabs({ base }:{ base:string }) {
  const pathname = usePathname();
  return (
    <div className="flex gap-2 flex-wrap mb-4">
      {tabs.map(([slug,label])=>{
        const href = `${base}/${slug}`;
        const active = pathname.startsWith(href);
        return (
          <Link key={slug} href={href}
            className={`px-3 py-2 rounded-md border text-sm ${active ? "bg-[var(--brand)] text-white border-[var(--brand)]" : "bg-[var(--card)]"}`}>
            {label}
          </Link>
        );
      })}
    </div>
  );
}
