"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Choice = [string,string];
type Choices = { person_types: Choice[]; formes_juridiques: Choice[]; statuts: Choice[]; countries: Choice[] };

export default function NewClientForm(){
  const router = useRouter();
  const [choices,setChoices] = useState<Choices>({ person_types:[], formes_juridiques:[], statuts:[], countries:[] });
  const [busy,setBusy] = useState(false);
  const [form,setForm] = useState({
    code:"", raison_sociale:"", denomination_commerciale:"",
    type_personne:"PM", forme_juridique:"", statut:"EXERCANTE",
    assujetti_tva:true, domicilie_sms:false,
    matricule_fiscal:"", identifiant_unique:"",
    adresse:"", ville:"", pays:"TN", code_postal:"",
    capital_social:"", valeur_nominale:""
  });

  useEffect(()=>{ (async()=>{
    try{
      const x = await (await fetch("http://127.0.0.1:8000/api/v1/exploitation/clients/choices/",{cache:"no-store"})).json();
      setChoices({
        person_types: Array.isArray(x?.person_types)?x.person_types:[],
        formes_juridiques: Array.isArray(x?.formes_juridiques)?x.formes_juridiques:[],
        statuts: Array.isArray(x?.statuts)?x.statuts:[],
        countries: Array.isArray(x?.countries)?x.countries:[]
      });
    }catch{}
  })(); },[]);

  function update<K extends keyof typeof form>(k:K, v:any){ setForm(s=>({...s,[k]:v})); }

  async function onSubmit(e:React.FormEvent){
    e.preventDefault(); setBusy(true);
    const res = await fetch("http://127.0.0.1:8000/api/v1/exploitation/clients/", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        ...form,
        capital_social:Number(form.capital_social||0),
        valeur_nominale:Number(form.valeur_nominale||0)
      })
    });
    setBusy(false);
    if(res.ok){ router.push("/exploitation/structure/clients"); router.refresh(); }
    else { alert("Erreur de création"); }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clients · Créer un nouveau client</h1>
        <div className="text-sm text-[var(--muted)]">* Champs obligatoires</div>
      </div>

      <form onSubmit={onSubmit} className="card space-y-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs">PP / PM *</label>
            <select className="select focus-ring" value={form.type_personne} onChange={e=>update("type_personne",e.target.value)}>
              {choices.person_types.map(([v,l])=> <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs">Intitulé / Raison Sociale *</label>
            <input className="input focus-ring" value={form.raison_sociale} onChange={e=>update("raison_sociale",e.target.value)} required/>
          </div>

          <div className="space-y-1">
            <label className="text-xs">Nomination Commerciale</label>
            <input className="input focus-ring" value={form.denomination_commerciale} onChange={e=>update("denomination_commerciale",e.target.value)}/>
          </div>

          <div className="space-y-1">
            <label className="text-xs">Statut *</label>
            <select className="select focus-ring" value={form.statut} onChange={e=>update("statut",e.target.value)}>
              {choices.statuts.map(([v,l])=> <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs">Forme Juridique</label>
            <select className="select focus-ring" value={form.forme_juridique} onChange={e=>update("forme_juridique",e.target.value)}>
              <option value="">—</option>
              {choices.formes_juridiques.map(([v,l])=> <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs">Code *</label>
            <input className="input focus-ring" value={form.code} onChange={e=>update("code",e.target.value)} required/>
          </div>

          <div className="space-y-1">
            <label className="text-xs">Assujetti à la TVA *</label>
            <select className="select focus-ring" value={String(form.assujetti_tva)} onChange={e=>update("assujetti_tva",e.target.value==="true")}>
              <option value="true">Oui</option><option value="false">Non</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs">Domicilié SMS *</label>
            <select className="select focus-ring" value={String(form.domicilie_sms)} onChange={e=>update("domicilie_sms",e.target.value==="true")}>
              <option value="false">Non</option><option value="true">Oui</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs">Matricule Fiscal</label>
            <input className="input focus-ring" value={form.matricule_fiscal} onChange={e=>update("matricule_fiscal",e.target.value)}/>
          </div>

          <div className="space-y-1">
            <label className="text-xs">Identifiant Unique</label>
            <input className="input focus-ring" value={form.identifiant_unique} onChange={e=>update("identifiant_unique",e.target.value)}/>
          </div>

          <div className="space-y-1">
            <label className="text-xs">Adresse **</label>
            <input className="input focus-ring" value={form.adresse} onChange={e=>update("adresse",e.target.value)}/>
          </div>

          <div className="space-y-1">
            <label className="text-xs">Ville **</label>
            <input className="input focus-ring" value={form.ville} onChange={e=>update("ville",e.target.value)}/>
          </div>

          <div className="space-y-1">
            <label className="text-xs">Pays **</label>
            <select className="select focus-ring" value={form.pays} onChange={e=>update("pays",e.target.value)}>
              {choices.countries.map(([v,l])=> <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs">Code Postal **</label>
            <input className="input focus-ring" value={form.code_postal} onChange={e=>update("code_postal",e.target.value)}/>
          </div>

          <div className="space-y-1">
            <label className="text-xs">Capital Social *</label>
            <input type="number" step="0.001" className="input focus-ring" value={form.capital_social} onChange={e=>update("capital_social",e.target.value)}/>
          </div>

          <div className="space-y-1">
            <label className="text-xs">Valeur Nominale *</label>
            <input type="number" step="0.001" className="input focus-ring" value={form.valeur_nominale} onChange={e=>update("valeur_nominale",e.target.value)}/>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="btn btn-primary" disabled={busy}>{busy?"Enregistrement…":"Sauvegarder et continuer"}</button>
        </div>
      </form>
    </section>
  );
}
