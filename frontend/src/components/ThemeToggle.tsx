"use client";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
export default function ThemeToggle(){
  const { theme,setTheme }=useTheme(); const next=theme==="dark"?"light":"dark";
  return(<button className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm" onClick={()=>setTheme(next)} aria-label="Basculer le thème">{theme==="dark"?<Sun size={16}/>:<Moon size={16}/>}<span>{theme==="dark"?"Clair":"Sombre"}</span></button>);
}
