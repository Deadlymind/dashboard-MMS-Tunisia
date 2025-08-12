"use client";
import { useState } from "react";

type Choice = [string,string];
type Choices = { person_types:Choice[]; formes_juridiques:Choice[]; statuts:Choice[]; countries:Choice[] };

export default function InfoForm({ id, initial, choices }:{ id:string; initial:any; choices:Choices }){
  const [busy,setBusy]=useState(false);
  const [form,setForm]=useState({
    code: initial?.code ?? "",
    raison_sociale: initial?.raison_sociale ?? "",
    denomination_commerciale: initial?.denomination_commerciale ?? "",
    type_personne: initial?.type_personne ?? "PM",
    statut: initial?.statut ?? "EXERCANTE",
    assujetti_tva: Boolean(initial?.assujetti_tva ?? true),
    domicilie_sms: Boolean(initial?.domicilie_sms ?? false),
    code_postal: initial?.code_postal ?? "",
    forme_juridique: initial?.forme_juridique ?? "",
    matricule_fiscal: initial?.matricule_fiscal ?? "",
    identifiant_unique: initial?.identifiant_unique ?? "",
    adresse: initial?.adresse ?? "",
    ville: initial?.ville ?? "",
    pays: initial?.pays ?? "TN",
    capital_social: String(initial?.capital_social ?? ""),
    valeur_nominale: String(initial?.valeur_nominale ?? ""),
    nombre_part: String(initial?.nombre_part ?? ""),
  });

  function update<K extends keyof typeof form>(k:K, v:any){ setForm(s=>({...s,[k]:v})); }

  async function onSubmit(e:React.FormEvent){
    e.preventDefault(); setBusy(true);
    const payload:any = { ...form,
      capital_social: Number(form.capital_social||0),
      valeur_nominale: Number(form.valeur_nominale||0),
      nombre_part: Number(form.nombre_part||0)
    };
    const r = await fetch(`http://127.0.0.1:8000/api/v1/exploitation/clients/${id}/`, {
      method:"PATCH", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload)
    });
    setBusy(false);
    if(!r.ok){
      const t = await r.text().catch(()=> "");
      alert("Échec de mise à jour.\n" + t + "\n(Si 401, activez temporairement permissions AllowAny côté API.)");
      return;
    }
    alert("Mise à jour réussie.");
  }

  const P = ({label,children}:{label:string;children:any})=>(
    <div className="space-y-1">
      <label className="text-xs">{label}</label>
      {children}
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="card space-y-6">
      <h2 className="font-semibold">Coordonnées de l'entreprise</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <P label="PP / PM *">
          <select className="select" value={form.type_personne} onChange={e=>update("type_personne", e.target.value)}>
            {(choices.person_types||[]).map(([v,l])=> <option key={v} value={v}>{l}</option>)}
          </select>
        </P>
        <P label="Intitulé *">
          <input className="input" value={form.raison_sociale} onChange={e=>update("raison_sociale",e.target.value)} required/>
        </P>
        <P label="Nomination Commerciale">
          <input className="input" value={form.denomination_commerciale} onChange={e=>update("denomination_commerciale",e.target.value)}/>
        </P>
        <P label="Statut *">
          <select className="select" value={form.statut} onChange={e=>update("statut",e.target.value)}>
            {(choices.statuts||[]).map(([v,l])=> <option key={v} value={v}>{l}</option>)}
          </select>
        </P>
        <P label="Matricule Fiscal">
          <input className="input" value={form.matricule_fiscal} onChange={e=>update("matricule_fiscal",e.target.value)}/>
        </P>
        <P label="Identifiant Unique">
          <input className="input" value={form.identifiant_unique} onChange={e=>update("identifiant_unique",e.target.value)}/>
        </P>
        <P label="Assujetti à la TVA *">
          <select className="select" value={String(form.assujetti_tva)} onChange={e=>update("assujetti_tva", e.target.value==="true")}>
            <option value="true">Oui</option><option value="false">Non</option>
          </select>
        </P>
        <P label="Domicilié SMS *">
          <select className="select" value={String(form.domicilie_sms)} onChange={e=>update("domicilie_sms", e.target.value==="true")}>
            <option value="false">Non</option><option value="true">Oui</option>
          </select>
        </P>
        <P label="Adresse **">
          <input className="input" value={form.adresse} onChange={e=>update("adresse",e.target.value)}/>
        </P>
        <P label="Ville **">
          <input className="input" value={form.ville} onChange={e=>update("ville",e.target.value)}/>
        </P>
        <P label="Pays **">
          <select className="select" value={form.pays} onChange={e=>update("pays",e.target.value)}>
            {(choices.countries||[]).map(([v,l])=> <option key={v} value={v}>{l}</option>)}
          </select>
        </P>
        <P label="Code Postal **">
          <input className="input" value={form.code_postal} onChange={e=>update("code_postal",e.target.value)}/>
        </P>
        <P label="Forme Juridique *">
          <select className="select" value={form.forme_juridique} onChange={e=>update("forme_juridique",e.target.value)}>
            <option value="">—</option>
            {(choices.formes_juridiques||[]).map(([v,l])=> <option key={v} value={v}>{l}</option>)}
          </select>
        </P>
        <P label="Capital Social *">
          <input type="number" step="0.001" className="input" value={form.capital_social} onChange={e=>update("capital_social",e.target.value)}/>
        </P>
        <P label="Valeur Nominale *">
          <input type="number" step="0.001" className="input" value={form.valeur_nominale} onChange={e=>update("valeur_nominale",e.target.value)}/>
        </P>
        <P label="Nombre de part">
          <input type="number" step="1" className="input" value={form.nombre_part} onChange={e=>update("nombre_part",e.target.value)}/>
        </P>
      </div>
      <div className="flex justify-end">
        <button className="btn btn-primary" disabled={busy}>{busy?"Mettre à jour…":"Mettre à jour"}</button>
      </div>
      <p className="text-xs text-[var(--muted)]">* Champs obligatoires. ** Champs obligatoires si la société n'est pas domiciliée.</p>
    </form>
  );
}
