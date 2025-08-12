"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Choice = [string,string];
type Choices = { person_types:Choice[]; formes_juridiques:Choice[]; statuts:Choice[]; countries:Choice[] };
const EMPTY: Choices = { person_types:[], formes_juridiques:[], statuts:[], countries:[] };

export default function NewClientForm({ choices }: { choices?: Choices }){
  const C = choices ?? EMPTY;
  const router = useRouter();
  const [busy,setBusy] = useState(false);
  const [form,setForm] = useState({
    raison_sociale: "", denomination_commerciale: "",
    type_personne: "PM", statut: "EXERCANTE",
    assujetti_tva: true, domicilie_sms: false,
    matricule_fiscal: "", identifiant_unique: "",
    adresse: "", ville: "", pays: "TN",
    code_postal: "", forme_juridique: "",
    capital_social: "", valeur_nominale: "", nombre_part: ""
  });
  const U = <K extends keyof typeof form>(k:K,v:any)=>setForm(s=>({...s,[k]:v}));

  async function onSubmit(e:React.FormEvent){
    e.preventDefault(); setBusy(true);
    const payload = {
      ...form,
      capital_social: Number(form.capital_social||0),
      valeur_nominale: Number(form.valeur_nominale||0),
      nombre_part: Number(form.nombre_part||0),
    };
    const r = await fetch("http://127.0.0.1:8000/api/v1/exploitation/clients/", {
      method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload)
    });
    setBusy(false);
    if(!r.ok){ alert("Création échouée"); return; }
    const created = await r.json();
    router.push(`/exploitation/structure/clients/${created.id}/informations`);
  }

  const P = ({label,children}:{label:string;children:any}) =>
    <div className="space-y-1"><label className="text-xs">{label}</label>{children}</div>;

  return (
    <form onSubmit={onSubmit} className="card space-y-6">
      <h2 className="font-semibold">Coordonnées de l entreprise</h2> 

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <P label="PP / PM *">
          <select className="select" value={form.type_personne} onChange={e=>U("type_personne",e.target.value)}>
            {(C.person_types).map(([v,l])=> <option key={v} value={v}>{l}</option>)}
          </select>
        </P>
        <P label="Intitulé *">
          <input className="input" value={form.raison_sociale} onChange={e=>U("raison_sociale",e.target.value)} required/>
        </P>
        <P label="Nomination Commerciale">
          <input className="input" value={form.denomination_commerciale} onChange={e=>U("denomination_commerciale",e.target.value)}/>
        </P>

        <P label="Statut *">
          <select className="select" value={form.statut} onChange={e=>U("statut",e.target.value)}>
            {(C.statuts).map(([v,l])=> <option key={v} value={v}>{l}</option>)}
          </select>
        </P>
        <P label="Matricule Fiscal">
          <input className="input" value={form.matricule_fiscal} onChange={e=>U("matricule_fiscal",e.target.value)}/>
        </P>
        <P label="Identifiant Unique">
          <input className="input" value={form.identifiant_unique} onChange={e=>U("identifiant_unique",e.target.value)}/>
        </P>

        <P label="Assujeti à la TVA *">
          <select className="select" value={String(form.assujetti_tva)} onChange={e=>U("assujetti_tva", e.target.value==="true")}>
            <option value="true">Oui.</option><option value="false">Non.</option>
          </select>
        </P>
        <P label="Adresse **">
          <input className="input" value={form.adresse} onChange={e=>U("adresse",e.target.value)}/>
        </P>
        <P label="Pays **">
          <select className="select" value={form.pays} onChange={e=>U("pays",e.target.value)}>
            {(C.countries).map(([v,l])=> <option key={v} value={v}>{l}</option>)}
          </select>
        </P>

        <P label="Code Postal **">
          <input className="input" value={form.code_postal} onChange={e=>U("code_postal",e.target.value)}/>
        </P>
        <P label="Ville **">
          <input className="input" value={form.ville} onChange={e=>U("ville",e.target.value)}/>
        </P>
        <P label="Valeur Nominale *">
          <input type="number" step="0.001" className="input" value={form.valeur_nominale} onChange={e=>U("valeur_nominale",e.target.value)}/>
        </P>

        <P label="Forme Juridique *">
          <select className="select" value={form.forme_juridique} onChange={e=>U("forme_juridique",e.target.value)}>
            <option value="">—</option>
            {(C.formes_juridiques).map(([v,l])=> <option key={v} value={v}>{l}</option>)}
          </select>
        </P>
        <P label="Capital Social *">
          <input type="number" step="0.001" className="input" value={form.capital_social} onChange={e=>U("capital_social",e.target.value)}/>
        </P>
        <P label="Nombre de part">
          <input type="number" step="1" className="input" value={form.nombre_part} onChange={e=>U("nombre_part",e.target.value)}/>
        </P>

        <P label="Domicilié SMS *">
          <select className="select" value={String(form.domicilie_sms)} onChange={e=>U("domicilie_sms", e.target.value==="true")}>
            <option value="false">Non.</option><option value="true">Oui.</option>
          </select>
        </P>
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary" disabled={busy}>{busy?"Créer…":"Créer le client"}</button>
      </div>
      <p className="text-xs text-[var(--muted)]">* Champs obligatoires. ** Champs obligatoires si la société n'est pas domiciliée.</p>
    </form>
  );
}
