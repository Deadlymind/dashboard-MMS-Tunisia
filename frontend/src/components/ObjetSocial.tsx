"use client";
import { useEffect, useState } from "react";

type Item = { id:number; code:number; nomination:string; agrement:boolean };
type Master = { id:number; nomination:string; agrement:boolean };

export default function ObjetSocial({ clientId }:{ clientId:string }){
  const base = `http://127.0.0.1:8000/api/v1/exploitation/clients/${clientId}/objet-social/`;
  const mastersUrl = "http://127.0.0.1:8000/api/v1/exploitation/objets-sociaux/";

  const [items,setItems] = useState<Item[]>([]);
  const [loading,setLoading] = useState(true);

  // menu / modals
  const [menuOpen,setMenuOpen] = useState(false);
  const [showCreate,setShowCreate] = useState(false);
  const [showAssign,setShowAssign] = useState(false);

  // create modal state
  const [newNom,setNewNom] = useState("");
  const [newAgr,setNewAgr] = useState(false);

  // assign modal state
  const [masters,setMasters] = useState<Master[]>([]);
  const [selected,setSelected] = useState<number|"">("");

  async function refresh(){
    setLoading(true);
    const r = await fetch(base, { cache:"no-store" });
    setItems(await r.json());
    setLoading(false);
  }
  useEffect(()=>{ refresh(); },[clientId]);

  async function removeItem(id:number){
    await fetch(`${base}${id}/`, { method:"DELETE" });
    await refresh();
  }

  async function openCreate(){
    setNewNom(""); setNewAgr(false);
    setShowCreate(true); setMenuOpen(false);
  }

  async function submitCreate(){
    // create master then attach to this client
    const m = await fetch(mastersUrl, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ nomination:newNom, agrement:newAgr })});
    if(!m.ok){ alert("Échec création objet social"); return; }
    await fetch(base, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ nomination:newNom, agrement:newAgr })});
    setShowCreate(false); await refresh();
  }

  async function openAssign(){
    const r = await fetch(mastersUrl, { cache:"no-store" });
    setMasters(await r.json());
    setSelected("");
    setShowAssign(true); setMenuOpen(false);
  }

  async function submitAssign(){
    const m = masters.find(x=>x.id===selected);
    if(!m){ alert("Sélectionnez un objet social"); return; }
    await fetch(base, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ nomination:m.nomination, agrement:m.agrement })});
    setShowAssign(false); await refresh();
  }

  return (
    <div className="space-y-4">

      {/* Header actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Liste des objets sociaux</h2>
        <div className="flex items-center gap-2 relative">
          <button className="btn btn-primary" onClick={()=>setMenuOpen(v=>!v)}>Ajouter</button>
          {menuOpen && (
            <div className="absolute right-0 top-10 card p-2 w-56 z-10">
              <button className="btn w-full mb-2" onClick={openCreate}>Créer un objet social</button>
              <button className="btn w-full" onClick={openAssign}>Affecter à la société</button>
            </div>
          )}
          <a className="btn" target="_blank" rel="noreferrer" href="https://sms-tunisia.com/professional/companysetting/socialobject">Paramètres</a>
        </div>
      </div>

      {/* Table */}
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
                  <button className="btn btn-danger" onClick={()=>removeItem(it.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40">
          <div className="card w-[520px]">
            <h3 className="text-center text-lg font-semibold mb-4">AJOUTER UN OBJET SOCIAL</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs">Nomination *</label>
                <input className="input" value={newNom} onChange={e=>setNewNom(e.target.value)}/>
              </div>
              <div className="space-y-1">
                <label className="text-xs">Avec Agrément *</label>
                <select className="select" value={String(newAgr)} onChange={e=>setNewAgr(e.target.value==="true")}>
                  <option value="false">Non.</option><option value="true">Oui.</option>
                </select>
              </div>
              <button className="btn btn-primary w-full" onClick={submitCreate}>Ajouter objet social</button>
              <p className="text-xs text-[var(--muted)]">* Champs obligatoires.</p>
              <div className="flex justify-end">
                <button className="btn" onClick={()=>setShowCreate(false)}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign modal */}
      {showAssign && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40">
          <div className="card w-[520px]">
            <h3 className="text-center text-lg font-semibold mb-4">AFFECTER UN OBJET SOCIAL</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs">Nomination *</label>
                <select className="select" value={String(selected)} onChange={e=>setSelected(Number(e.target.value))}>
                  <option value="">Sélectionnez un objet social</option>
                  {masters.map(m=> <option key={m.id} value={m.id}>{m.nomination}</option>)}
                </select>
              </div>
              <button className="btn btn-primary w-full" onClick={submitAssign}>Ajouter objet social</button>
              <p className="text-xs text-[var(--muted)]">* Champs obligatoires.</p>
              <div className="flex justify-end">
                <button className="btn" onClick={()=>setShowAssign(false)}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
