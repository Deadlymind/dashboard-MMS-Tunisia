"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Factory, ChevronRight, ChevronDown, FolderTree,
  UsersRound, Package, Files, ClipboardList, BarChart3
} from "lucide-react";

type Leaf = { label: string; href: string };
type Node = { id: string; label: string; icon?: React.ReactNode; children?: (Leaf|Node)[]; href?: string };

const NAV: Node = {
  id: "exploitation",
  label: "Exploitation",
  icon: <Factory size={16} />,
  children: [
    {
      id: "exploitation/structure",
      label: "Structure",
      icon: <FolderTree size={16} />,
      children: [
        { label: "Clients",              href: "/exploitation/structure/clients" },
        { label: "Fournisseurs",         href: "/exploitation/structure/fournisseurs" },
        { label: "Sous-traitants",       href: "/exploitation/structure/sous-traitants" },
        { label: "Modèles & Imprimés",   href: "/exploitation/structure/modeles-imprimes" },
        { label: "Articles",             href: "/exploitation/structure/articles" },
        { label: "Familles d’articles",  href: "/exploitation/structure/familles-articles" },
      ],
    },
    { id: "exploitation/traitement", label: "Traitement", icon: <ClipboardList size={16} />, href: "/exploitation/traitement" },
    { id: "exploitation/suivi",      label: "Suivi",      icon: <UsersRound size={16} />,     href: "/exploitation/suivi" },
    { id: "exploitation/etats",      label: "États",      icon: <BarChart3 size={16} />,      href: "/exploitation/etats" },
  ],
};

function ItemLeaf({ leaf, active }: { leaf: Leaf; active: boolean }) {
  return (
    <Link
      href={leaf.href}
      className={`block px-4 py-2 text-sm rounded-md hover:bg-[var(--base-200)] ${
        active ? "bg-[var(--base-200)] font-medium" : "text-[var(--muted)]"
      }`}
    >
      {leaf.label}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  // Auto-open groups that match the current path
  useEffect(() => {
    const o: Record<string, boolean> = {};
    const ensureOpen = (node: Node) => {
      if (pathname.startsWith("/" + node.id)) o[node.id] = true;
      node.children?.forEach((c) => {
        if ("children" in c && c.children) ensureOpen(c as Node);
      });
    };
    ensureOpen(NAV);
    // Always open the root group
    o[NAV.id] = true;
    setOpen((prev) => ({ ...prev, ...o }));
  }, [pathname]);

  const toggle = (id: string) => setOpen((s) => ({ ...s, [id]: !s[id] }));

  const renderNode = (node: Node, depth = 0) => {
    const isOpen = !!open[node.id];
    const isActive = pathname.startsWith("/" + node.id);
    const hasChildren = (node.children ?? []).length > 0;

    return (
      <div key={node.id} className="mb-1">
        <button
          onClick={() => (hasChildren ? toggle(node.id) : undefined)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-md ${
            isActive ? "bg-[var(--base-200)]" : "hover:bg-[var(--base-200)]"
          }`}
        >
          <span className="flex items-center gap-2 text-sm">
            {node.icon}
            <span>{node.label}</span>
          </span>
          {hasChildren ? (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : null}
        </button>

        {hasChildren && isOpen && (
          <div className="mt-1 ml-2 border-l border-[var(--base-300)]">
            {(node.children as (Leaf|Node)[]).map((c, idx) =>
              "children" in c ? (
                <div key={idx} className="pl-2">{renderNode(c as Node, depth + 1)}</div>
              ) : (
                <div key={(c as Leaf).href} className="pl-3">
                  <ItemLeaf leaf={c as Leaf} active={pathname.startsWith((c as Leaf).href)} />
                </div>
              )
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 shrink-0 border-r border-[var(--base-300)] bg-[var(--base-100)] h-screen sticky top-0 overflow-y-auto">
      <div className="p-4">
        <Link href="/" className="block font-semibold text-sm mb-4">MMS Tunisia</Link>
        {renderNode(NAV)}
      </div>
    </aside>
  );
}
