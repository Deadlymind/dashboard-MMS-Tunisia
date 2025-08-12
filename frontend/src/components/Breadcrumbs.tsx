"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function Breadcrumbs(){
  const p = usePathname().split("/").filter(Boolean);
  let href = "";
  return (
    <nav className="text-xs text-[var(--muted)]">
      <ol className="flex items-center gap-1">
        <li><Link href="/" className="hover:underline">Accueil</Link></li>
        {p.map((seg,i)=>{ href += "/"+seg; const label = decodeURIComponent(seg).replace(/-/g," "); return (
          <li key={i} className="flex items-center gap-1">
            <span>›</span>
            <Link href={href} className="hover:underline capitalize">{label}</Link>
          </li>
        );})}
      </ol>
    </nav>
  );
}
