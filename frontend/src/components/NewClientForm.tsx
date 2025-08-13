"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Opt = string | [string, string];
type CountryLike = { code?: string; alpha2?: string; alpha_2?: string; name?: string; label?: string };
type Choices = {
  person_types?: Opt[];
  statuts?: Opt[];
  forme_juridique?: Opt[];      // some backends use singular
  formes_juridiques?: Opt[];    // ours uses plural
  countries?: CountryLike[];
};

type ClientPayload = {
  code?: string;
  raison_sociale?: string;
  denomination_commerciale?: string;
  type_personne?: string;
  statut?: string;
  assujetti_tva?: boolean;
  domicilie_sms?: boolean;
  matricule_fiscal?: string;
  identifiant_unique?: string;
  code_postal?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  forme_juridique?: string;
  capital_social?: string;
  valeur_nominale?: string;
  nombre_part?: number;
};

function toOptions(list?: Opt[]) {
  return (list ?? []).map((item) =>
    Array.isArray(item)
      ? { value: String(item[0]), label: String(item[1]) }
      : { value: String(item), label: String(item) }
  );
}
function countryOptions(list?: CountryLike[]) {
  return (list ?? []).map((c) => ({
    value: String(c.code ?? c.alpha2 ?? c.alpha_2 ?? ""),
    label: String(c.name ?? c.label ?? c.code ?? ""),
  }));
}

const API = (process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/,"") || "http://127.0.0.1:8000") + "/api/v1";

export default function NewClientForm({ choices }: { choices: Choices }) {
  const router = useRouter();

  const personOpts = useMemo(() => toOptions(choices?.person_types), [choices]);
  const statutOpts = useMemo(() => toOptions(choices?.statuts), [choices]);
  const formeList = (choices?.formes_juridiques ?? choices?.forme_juridique) as Opt[] | undefined;
  const formeOpts = useMemo(() => toOptions(formeList), [choices]);
  const countryOpts = useMemo(() => countryOptions(choices?.countries), [choices]);

  const [form, setForm] = useState<ClientPayload>({
    type_personne: personOpts[0]?.value ?? "PM",
    statut:        statutOpts[0]?.value ?? "EX",
    assujetti_tva: true,
    domicilie_sms: false,
    pays:          countryOpts.find(o => o.value === "TN")?.value ?? (countryOpts[0]?.value ?? "TN"),
    forme_juridique: formeOpts[0]?.value ?? "SARL",
    capital_social: "0.000",
    valeur_nominale: "0.000",
    nombre_part: 0,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const U = <K extends keyof ClientPayload>(k: K, v: ClientPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      if (!form.raison_sociale?.trim()) throw new Error("L'intitulé (raison sociale) est obligatoire.");
      if (!form.type_personne) throw new Error("PP / PM est obligatoire.");

      const res = await fetch(`${API}/exploitation/clients/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      setMsg("Créé ✅");
      router.push(`/exploitation/structure/clients/${created.id}/informations`);
    } catch (err: any) {
      setMsg("Erreur: " + (err?.message || String(err)));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <h1 className="text-xl font-semibold">Nouveau client</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">PP / PM *</span>
          <select className="select" value={form.type_personne ?? ""} onChange={(e)=>U("type_personne", e.target.value)}>
            {personOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">Statut *</span>
          <select className="select" value={form.statut ?? ""} onChange={(e)=>U("statut", e.target.value)}>
            {statutOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">Assujetti à la TVA *</span>
          <select className="select" value={form.assujetti_tva ? "true" : "false"} onChange={(e)=>U("assujetti_tva", e.target.value==="true")}>
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">Domicilié SMS *</span>
          <select className="select" value={form.domicilie_sms ? "true" : "false"} onChange={(e)=>U("domicilie_sms", e.target.value==="true")}>
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">Forme Juridique *</span>
          <select className="select" value={form.forme_juridique ?? ""} onChange={(e)=>U("forme_juridique", e.target.value)}>
            {formeOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">Pays **</span>
          <select className="select" value={form.pays ?? ""} onChange={(e)=>U("pays", e.target.value)}>
            {countryOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">Intitulé *</span>
          <input className="input" value={form.raison_sociale ?? ""} onChange={(e)=>U("raison_sociale", e.target.value)} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">Nomination Commerciale</span>
          <input className="input" value={form.denomination_commerciale ?? ""} onChange={(e)=>U("denomination_commerciale", e.target.value)} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">Capital Social *</span>
          <input className="input" value={form.capital_social ?? ""} onChange={(e)=>U("capital_social", e.target.value)} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">Valeur Nominale *</span>
          <input className="input" value={form.valeur_nominale ?? ""} onChange={(e)=>U("valeur_nominale", e.target.value)} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">Nombre de part</span>
          <input className="input" type="number" value={form.nombre_part ?? 0} onChange={(e)=>U("nombre_part", Number(e.target.value || 0))} />
        </label>

        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-sm font-medium text-muted-foreground">Adresse **</span>
          <input className="input" value={form.adresse ?? ""} onChange={(e)=>U("adresse", e.target.value)} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">Ville **</span>
          <input className="input" value={form.ville ?? ""} onChange={(e)=>U("ville", e.target.value)} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">Code Postal **</span>
          <input className="input" value={form.code_postal ?? ""} onChange={(e)=>U("code_postal", e.target.value)} />
        </label>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Création…" : "Créer"}</button>
        {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
      </div>
    </form>
  );
}
