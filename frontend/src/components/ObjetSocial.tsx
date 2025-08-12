"use client";
import { useEffect, useState } from "react";

type Item   = { id:number; code:number; nomination:string; agrement:boolean };
type Master = { id:number; nomination:string; agrement:boolean };

export default function ObjetSocial({ clientId }:{ clientId:string }){
  const base = `http://127.0.0.1:8000/api/v1/exploitation/clients/${clientId}/objet-social/`;
  const mastersUrl = "http://127.0.0.1:8000/api/v1/exploitation/objets-sociaux/";

  const [items,setItems] = useState<Item[]>([]);
  const [loading,setLoading] = useState(true);

  // unified modal
  const [open,setOpen] = useState(false);
  const [masters,setMasters] = useState<Master[]>([]);
  const [nom,setNom] = useState("");
  const [agr,setAgr] = useState(false);
  const [matchedId,setMatchedId] = useState<number|null>(null);

  async function refresh(){
    setLoading(true);
    const r = await fetch(base, { cache:"no-store" });
    setItems(await r.json());
    setLoading(false);
  }
  useEffect(()=>{ refresh(); },[clientId]);

  async function openModal(){
    const r = await fetch(mastersUrl, { cache:"no-store" });
    setMasters(await r.json());
    setNom(""); setAgr(false); setMatchedId(null);
    setOpen(true);
  }

  function onNomChange(v:string){
    setNom(v);
    const m = masters.find(x => x.nomination.toLowerCase() === v.trim().toLowerCase());
    if (m){ setMatchedId(m.id); setAgr(!!m.agrement); } else { setMatchedId(null); }
  }

  async function submit(){
    // If matched to existing master → attach; else create master then attach
    if(matchedId !== null){
      const m = masters.find(x=>x.id===matchedId);
      if(!m){ alert("Sélection invalide."); return; }
      const r = await fetch(base, {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ nomination:m.nomination, agrement:m.agrement })
      });
      if(!r.ok){ alert("Échec d'affectation"); return; }
    }else{
      if(!nom.trim()){ alert("Nomination est obligatoire."); return; }
      const m = await fetch(mastersUrl, {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ nomination: nom.trim(), agrement: agr })
      });
      if(!m.ok){ alert("Échec de création"); return; }
      const r = await fetch(base, {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ nomination: nom.trim(), agrement: agr })
      });
      if(!r.ok){ alert("Échec d'affectation"); return; }
    }
    setOpen(false);
    await refresh();
  }

  async function removeItem(id:number){
    await fetch(`${base}${id}/`, { method:"DELETE" });
    await refresh();
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Liste des objets sociaux</h2>
        <div className="flex items-center gap-2">
          <button className="btn btn-primary" onClick={openModal}>Ajouter</button>
          <a className="btn" target="_blank" rel="noreferrer"
             href="http://localhost:3000/professional/companysetting">Paramètres</a>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-auto">
        {loading ? (
          <div className="p-4 text-sm text-[var(--muted)]">Chargement…</div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>CODE</th><th>NOMINATION</th><th>AGRÉMENT</th><th>ACTION</th></tr>
            </thead>
            <tbody>
              {items.map(it=>(
                <tr key={it.id} className="row">
                  <td className="p-2">{it.code}</td>
                  <td className="p-2">{it.nomination}</td>
                  <td className="p-2">{it.agrement ? "Oui" : "Non"}</td>
                  <td className="p-2">
                    <button className="btn btn-danger" onClick={()=>removeItem(it.id)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* One modal with one "Nomination *" */}
      {open && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40">
          <div className="card w-[560px]">
            <h3 className="text-center text-lg font-semibold mb-4">AJOUTER / AFFECTER UN OBJET SOCIAL</h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs">Nomination *</label>
                {/* input with suggestions from master list */}
                <input list="os-list" className="input" value={nom}
                       onChange={e=>onNomChange(e.target.value)} placeholder="Sélectionnez un objet social" />
                <datalist id="os-list">
                  {masters.map(m => <option key={m.id} value={m.nomination} />)}
                </datalist>
                <p className="text-[11px] text-[var(--muted)]">
                  Sélectionnez un objet existant ou saisissez un nouveau nom.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs">Avec Agrément *</label>
                <select className="select" value={String(agr)} onChange={e=>setAgr(e.target.value==="true")}>
                  <option value="false">Non.</option>
                  <option value="true">Oui.</option>
                </select>
                {matchedId !== null && (
                  <p className="text-[11px] text-[var(--muted)]">Valeur héritée de l objet existant.</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <button className="btn" onClick={()=>setOpen(false)}>Fermer</button>
              <div className="flex-1" />
              <button className="btn btn-primary" onClick={submit}>
                {matchedId !== null ? "Affecter" : "Ajouter"}
              </button>
            </div>

            <p className="text-xs text-[var(--muted)] mt-2">* Champs obligatoires.</p>
          </div>
        </div>
      )}
    </div>
  );
}
