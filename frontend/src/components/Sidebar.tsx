"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Boxes, ChevronDown, ChevronRight, Users, Package, Tag, FileText, Building2, Briefcase } from "lucide-react";

type NavItem = { label:string; href:string; icon: any; };
type Group = { label:string; items: NavItem[]; };

const structure: Group = {
  label: "Structure",
  items: [
    { label:"Clients", href:"/exploitation/structure/clients", icon: Users },
    { label:"Fournisseurs", href:"/exploitation/structure/fournisseurs", icon: Building2 },
    { label:"Sous-traitants", href:"/exploitation/structure/sous-traitants", icon: Briefcase },
    { label:"Modèles & Imprimés", href:"/exploitation/structure/modeles-imprimes", icon: FileText },
    { label:"Articles", href:"/exploitation/structure/articles", icon: Package },
    { label:"Familles d’articles", href:"/exploitation/structure/familles-articles", icon: Tag },
  ],
};

const groups: Group[] = [
  structure,
  { label:"Traitement", items: [] },
  { label:"Suivi", items: [] },
  { label:"États", items: [] },
];

export default function Sidebar(){
  const pathname = usePathname();
  const [open,setOpen] = useState<Record<string,boolean>>({});
  useEffect(()=>{ const x = localStorage.getItem("sb-open"); if(x) setOpen(JSON.parse(x)); },[]);
  useEffect(()=>{ localStorage.setItem("sb-open", JSON.stringify(open)); },[open]);

  function Section({g}:{g:Group}){
    const expanded = open[g.label] ?? g.label==="Structure"; // Structure open by default
    return (
      <div className="mt-3">
        <button onClick={()=>setOpen(s=>({...s,[g.label]:!expanded}))} className="flex items-center justify-between w-full px-3 py-2 text-xs uppercase tracking-wide text-[var(--muted)]">
          <span className="inline-flex items-center gap-2"><Boxes size={14}/>{g.label}</span>
          {expanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
        </button>
        {expanded && (
          <ul className="px-2">
            {g.items.map((it)=> {
              const active = pathname.startsWith(it.href);
              return (
                <li key={it.href}>
                  <Link href={it.href}
                    className={`flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[var(--surface)] ${active ? "bg-[var(--surface)] font-medium" : ""}`}>
                    <it.icon size={16}/> <span className="text-sm">{it.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  return (
    <aside className="hidden lg:block sticky top-0 h-screen w-[260px] border-r" style={{borderColor:"var(--line)"}}>
      <div className="h-14 border-b flex items-center px-3" style={{borderColor:"var(--line)"}}>
        <div className="h-8 w-8 rounded-md" style={{background:"var(--brand)"}} />
        <div className="ml-2 font-semibold">Murex</div>
      </div>
      <div className="p-2">
        {groups.map(g => <Section key={g.label} g={g}/>)}
      </div>
    </aside>
  );
}
