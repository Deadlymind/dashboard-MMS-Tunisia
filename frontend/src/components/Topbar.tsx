"use client";
import ThemeToggle from "@/components/ThemeToggle";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function Topbar(){
  const router = useRouter();
  const pathname = usePathname();
  const [q,setQ] = useState("");
  function onSearch(e:React.FormEvent){ e.preventDefault(); const url = new URL(location.origin + pathname); if(q) url.searchParams.set("q",q); else url.searchParams.delete("q"); router.push(url.pathname + (url.search||"")); }
  return (
    <header className="sticky top-0 z-20 bg-[var(--surface)] border-b" style={{borderColor:"var(--line)"}}>
      <div className="h-14 container-px flex items-center justify-between">
        <Breadcrumbs/>
        <div className="flex items-center gap-2">
          <form onSubmit={onSearch} className="hidden md:flex items-center gap-2">
            <input className="input focus-ring min-w-[280px]" placeholder="Rechercher…" value={q} onChange={e=>setQ(e.target.value)}/>
            <button className="btn">Rechercher</button>
          </form>
          <ThemeToggle/>
        </div>
      </div>
    </header>
  );
}
