"use client";
import { useEffect, useState } from "react";

type Item = { id:number; code:number; nomination:string; agrement:boolean };

export default function ObjetSocial({ clientId }:{ clientId:string }){
  const [items,setItems] = useState<Item[]>([]);
  const [loading,setLoading] = useState(true);
  const [nomination,setNomination] = useState("");
  const [agrement,setAgrement] = useState(false);

  const base = `http://127.0.0.1:8000/api/v1/exploitation/clients/${clientId}/objet-social/`;

  async function refresh(){
    setLoading(true);
    const r = await fetch(base, { cache:"no-store" });
    const data = await r.json();
    setItems(Array.isArray(data) ? data : (data.results ?? []));
    setLoading(false);
  }

  useEffect(()=>{ refresh(); },[clientId]);

  async function addItem(){
    if(!nomination.trim()) return;
    await fetch(base, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ nomination, agrement }) });
    setNomination(""); setAgrement(false); await refresh();
  }

  async function removeItem(id:number){
    await fetch(`${base}${id}/`, { method:"DELETE" });
    await refresh();
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="grid md:grid-cols-3 gap-3">
          <input className="input" placeholder="Nomination" value={nomination} onChange={e=>setNomination(e.target.value)} />
          <select className="select" value={String(agrement)} onChange={e=>setAgrement(e.target.value==="true")}>
            <option value="false">Agrément: Non</option>
            <option value="true">Agrément: Oui</option>
          </select>
          <button onClick={addItem} className="btn btn-primary">Ajouter</button>
        </div>
      </div>

      <div className="card overflow-auto">
        {loading ? <div className="p-4 text-sm text-[var(--muted)]">Chargement…</div> :
        <table className="table">
          <thead><tr><th>CODE</th><th>NOMINATION</th><th>AGRÉMENT</th><th>ACTION</th></tr></thead>
          <tbody>
            {items.map(it=>(
              <tr key={it.id} className="row">
                <td className="p-2">{it.code}</td>
                <td className="p-2">{it.nomination}</td>
                <td className="p-2">{it.agrement ? "Oui" : "Non"}</td>
                <td className="p-2">
                  <button onClick={()=>removeItem(it.id)} className="btn">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>}
      </div>
    </div>
  );
}
