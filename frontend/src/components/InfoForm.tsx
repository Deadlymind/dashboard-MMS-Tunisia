"use client";
import { useState } from "react";

type Opt = string | [string, string];
type CountryLike = { code?: string; alpha2?: string; alpha_2?: string; name?: string; label?: string };

type Choices = {
  person_types?: Opt[];
  statuts?: Opt[];
  forme_juridique?: Opt[];
  countries?: CountryLike[];
};

type Client = {
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export default function InfoForm({
  id,
  initial,
  choices,
}: {
  id: string;
  initial: Client;
  choices: Choices;
}) {
  const [form, setForm] = useState<Client>({ ...initial });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const U = <K extends keyof Client>(k: K, v: Client[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    // ---- IMPORTANT: never send `code` on PATCH ----
    const { code: _omit, ...payload } = form;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/exploitation/clients/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || res.statusText);
      }
      setMsg("Enregistré ✅");
    } catch (err: any) {
      setMsg(`Erreur: ${err?.message ?? String(err)}`);
    } finally {
      setSaving(false);
    }
  }

  const personTypeOpts = toOptions(choices?.person_types);
  const statutOpts = toOptions(choices?.statuts);
  const formeOpts = toOptions((choices?.formes_juridiques ?? choices?.forme_juridique) as any);
  const countryOpts = countryOptions(choices?.countries);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* read-only display of the code (no input name, so it won't be sent) */}
      {initial?.code && (
        <div className="card">
          <div className="text-sm" style={{ color: "var(--muted)" }}>Code</div>
          <div className="input" aria-disabled="true">{initial.code}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="PP / PM *">
          <select
            className="select"
            value={form.type_personne ?? ""}
            onChange={(e) => U("type_personne", e.target.value)}
          >
            {personTypeOpts.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Statut *">
          <select
            className="select"
            value={form.statut ?? ""}
            onChange={(e) => U("statut", e.target.value)}
          >
            {statutOpts.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Assujetti à la TVA *">
          <select
            className="select"
            value={form.assujetti_tva ? "true" : "false"}
            onChange={(e) => U("assujetti_tva", e.target.value === "true")}
          >
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </select>
        </Field>

        <Field label="Domicilié SMS *">
          <select
            className="select"
            value={form.domicilie_sms ? "true" : "false"}
            onChange={(e) => U("domicilie_sms", e.target.value === "true")}
          >
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </select>
        </Field>

        <Field label="Forme Juridique *">
          <select
            className="select"
            value={form.forme_juridique ?? ""}
            onChange={(e) => U("forme_juridique", e.target.value)}
          >
            {formeOpts.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Pays **">
          <select
            className="select"
            value={form.pays ?? ""}
            onChange={(e) => U("pays", e.target.value)}
          >
            {countryOpts.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Intitulé *">
          <input
            className="input"
            value={form.raison_sociale ?? ""}
            onChange={(e) => U("raison_sociale", e.target.value)}
          />
        </Field>

        <Field label="Nomination Commerciale">
          <input
            className="input"
            value={form.denomination_commerciale ?? ""}
            onChange={(e) => U("denomination_commerciale", e.target.value)}
          />
        </Field>

        <Field label="Matricule Fiscal">
          <input
            className="input"
            value={form.matricule_fiscal ?? ""}
            onChange={(e) => U("matricule_fiscal", e.target.value)}
          />
        </Field>

        <Field label="Identifiant Unique">
          <input
            className="input"
            value={form.identifiant_unique ?? ""}
            onChange={(e) => U("identifiant_unique", e.target.value)}
          />
        </Field>

        <Field label="Adresse **">
          <input
            className="input"
            value={form.adresse ?? ""}
            onChange={(e) => U("adresse", e.target.value)}
          />
        </Field>

        <Field label="Ville **">
          <input
            className="input"
            value={form.ville ?? ""}
            onChange={(e) => U("ville", e.target.value)}
          />
        </Field>

        <Field label="Code Postal **">
          <input
            className="input"
            value={form.code_postal ?? ""}
            onChange={(e) => U("code_postal", e.target.value)}
          />
        </Field>

        <Field label="Capital Social *">
          <input
            className="input"
            value={form.capital_social ?? ""}
            onChange={(e) => U("capital_social", e.target.value)}
          />
        </Field>

        <Field label="Valeur Nominale *">
          <input
            className="input"
            value={form.valeur_nominale ?? ""}
            onChange={(e) => U("valeur_nominale", e.target.value)}
          />
        </Field>

        <Field label="Nombre de part">
          <input
            className="input"
            type="number"
            value={form.nombre_part ?? 0}
            onChange={(e) => U("nombre_part", Number(e.target.value || 0))}
          />
        </Field>
      </div>

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? "Enregistrement..." : "Mettre à jour"}
      </button>

      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
    </form>
  );
}
