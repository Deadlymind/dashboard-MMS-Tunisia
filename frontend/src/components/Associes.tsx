"use client";

import React, { useEffect, useState } from "react";
import {
  getClientAssocies,
  createClientAssocie,
  deleteClientAssocie,
  updateClientAssocie, // <-- make sure this exists in lib/api.ts (PATCH helper)
} from "@/lib/api";
import { getChoices } from "@/lib/api";

type Associe = {
  id: number;
  type: "PARTICULIER" | "SOCIETE";
  age_legal: "MAJEUR" | "MINEUR";
  civilite: "MR" | "MLLE" | "MME";
  prenom?: string;
  nom?: string;
  nationalite?: string;
  date_naissance?: string | null;
  lieu_naissance?: string;
  doc_type: "CIN" | "PASSEPORT";
  doc_numero?: string;
  doc_date?: string | null;
  doc_delivre_a?: string;
  code_postal?: string;
  ville?: string;
  pays?: string;
  gsm?: string;
  email?: string;
  nombre_parts: number;
  fonctionnaire_public: boolean;
};

type Country = { code?: string; alpha_2?: string; name?: string };

export default function Associes({ clientId }: { clientId: string }) {
  const [items, setItems] = useState<Associe[]>([]);
  const [loading, setLoading] = useState(true);

  // CREATE modal (unchanged)
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // EDIT modal
  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [edit, setEdit] = useState<Associe | null>(null);

  // choices
  const [countries, setCountries] = useState<Country[]>([]);

  // create form state (unchanged)
  const [form, setForm] = useState<Associe>({
    id: 0 as any,
    type: "PARTICULIER",
    age_legal: "MAJEUR",
    civilite: "MR",
    prenom: "",
    nom: "",
    nationalite: "TN",
    date_naissance: "",
    lieu_naissance: "",
    doc_type: "CIN",
    doc_numero: "",
    doc_date: "",
    doc_delivre_a: "",
    code_postal: "",
    ville: "",
    pays: "TN",
    gsm: "",
    email: "",
    nombre_parts: 0,
    fonctionnaire_public: false,
  });

  function U<K extends keyof Associe>(k: K, v: Associe[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function UE<K extends keyof Associe>(k: K, v: Associe[K]) {
    setEdit((e) => (e ? { ...e, [k]: v } : e));
  }

  async function load() {
    setLoading(true);
    try {
      const arr = await getClientAssocies(clientId);
      setItems(Array.isArray(arr) ? arr : []);
    } finally {
      setLoading(false);
    }
  }

  async function loadCountries() {
    try {
      const ch = await getChoices();
      setCountries(ch?.countries ?? []);
    } catch {
      setCountries([{ code: "TN", name: "Tunisia" }]);
    }
  }

  useEffect(() => {
    load();
    loadCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  // CREATE submit (unchanged)
  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = { ...form };
      // clean id
      // @ts-ignore
      delete body.id;
      // empty dates -> null
      if (!body.date_naissance) body.date_naissance = null as any;
      if (!body.doc_date) body.doc_date = null as any;

      await createClientAssocie(clientId, body);
      setOpen(false);
      setForm((f) => ({ ...f, prenom: "", nom: "", doc_numero: "", nombre_parts: 0 }));
      await load();
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'ajout.");
    } finally {
      setSaving(false);
    }
  }

  // DELETE (unchanged)
  async function onDelete(id: number) {
    if (!confirm("Supprimer cet associé ?")) return;
    await deleteClientAssocie(clientId, id);
    await load();
  }

  // EDIT flow
  function onOpenEdit(row: Associe) {
    setEditError(null);
    setEdit({
      ...row,
      // ensure dates are strings (or empty string) for <input type="date">
      date_naissance: row.date_naissance ?? "",
      doc_date: row.doc_date ?? "",
    });
    setEditOpen(true);
  }

  async function onEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!edit) return;
    setSavingEdit(true);
    setEditError(null);
    try {
      const body: Partial<Associe> = {
        type: edit.type,
        age_legal: edit.age_legal,
        civilite: edit.civilite,
        prenom: edit.prenom,
        nom: edit.nom,
        nationalite: edit.nationalite,
        date_naissance: edit.date_naissance || null,
        lieu_naissance: edit.lieu_naissance,
        doc_type: edit.doc_type,
        doc_numero: edit.doc_numero,
        doc_date: edit.doc_date || null,
        doc_delivre_a: edit.doc_delivre_a,
        code_postal: edit.code_postal,
        ville: edit.ville,
        pays: edit.pays,
        gsm: edit.gsm,
        email: edit.email,
        nombre_parts: Math.max(0, Math.min(100, Number(edit.nombre_parts || 0))),
        fonctionnaire_public: !!edit.fonctionnaire_public,
      };
      await updateClientAssocie(clientId, edit.id, body);
      setEditOpen(false);
      setEdit(null);
      await load();
    } catch (err: any) {
      setEditError(err?.message || "Erreur lors de la mise à jour.");
    } finally {
      setSavingEdit(false);
    }
  }

  const countryOpts = (countries ?? []).map((c) => ({
    value: String(c.code || c.alpha_2 || ""),
    label: String(c.name || c.code || ""),
  }));

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Liste des associés et actionnaires</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center rounded-lg bg-black text-white px-3 py-2 text-sm hover:opacity-90"
          >
            + Ajouter un nouveau associé
          </button>
        </div>
      </div>

      <div className="overflow-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-black-50">
            <tr className="text-left">
              <th className="px-4 py-3">CODE</th>
              <th className="px-4 py-3">NOMINATION</th>
              <th className="px-4 py-3">PARTS</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-4" colSpan={4}>Chargement…</td></tr>
            ) : (items?.length ?? 0) === 0 ? (
              <tr><td className="px-4 py-4" colSpan={4}>Aucun associé.</td></tr>
            ) : (
              items.map((it) => {
                const nom = (it.prenom?.trim() || "") + " " + (it.nom?.trim() || "");
                return (
                  <tr key={it.id} className="border-t">
                    <td className="px-4 py-3">{it.id}</td>
                    <td className="px-4 py-3">{nom.trim() || "-"}</td>
                    <td className="px-4 py-3">{it.nombre_parts}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => onOpenEdit(it)}
                        className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => onDelete(it.id)}
                        className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL (unchanged) */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Ajouter un associé</h3>
              <button onClick={() => setOpen(false)} className="text-sm opacity-70 hover:opacity-100">✕</button>
            </div>

            {error && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={onCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="text-sm">
                  <div className="mb-1">Type *</div>
                  <select className="w-full rounded-lg border px-3 py-2"
                          value={form.type}
                          onChange={(e)=>U("type", e.target.value as any)}>
                    <option value="PARTICULIER">particulier</option>
                    <option value="SOCIETE">société</option>
                  </select>
                </label>

                <label className="text-sm">
                  <div className="mb-1">Âge légal *</div>
                  <select className="w-full rounded-lg border px-3 py-2"
                          value={form.age_legal}
                          onChange={(e)=>U("age_legal", e.target.value as any)}>
                    <option value="MAJEUR">Associé Majeur</option>
                    <option value="MINEUR">Associé Mineur</option>
                  </select>
                </label>

                <label className="text-sm">
                  <div className="mb-1">Civilité *</div>
                  <select className="w-full rounded-lg border px-3 py-2"
                          value={form.civilite}
                          onChange={(e)=>U("civilite", e.target.value as any)}>
                    <option value="MR">Mr.</option>
                    <option value="MLLE">Mlle</option>
                    <option value="MME">Mme</option>
                  </select>
                </label>

                <label className="text-sm">
                  <div className="mb-1">Prénom</div>
                  <input className="w-full rounded-lg border px-3 py-2"
                         value={form.prenom ?? ""} onChange={(e)=>U("prenom", e.target.value)} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Nom</div>
                  <input className="w-full rounded-lg border px-3 py-2"
                         value={form.nom ?? ""} onChange={(e)=>U("nom", e.target.value)} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Nationalité</div>
                  <select className="w-full rounded-lg border px-3 py-2"
                          value={form.nationalite ?? ""}
                          onChange={(e)=>U("nationalite", e.target.value)}>
                    {countryOpts.map((o)=>(
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </label>

                <label className="text-sm">
                  <div className="mb-1">Date de naissance</div>
                  <input type="date" className="w-full rounded-lg border px-3 py-2"
                         value={form.date_naissance ?? ""} onChange={(e)=>U("date_naissance", e.target.value)} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Lieu de naissance</div>
                  <input className="w-full rounded-lg border px-3 py-2"
                         value={form.lieu_naissance ?? ""} onChange={(e)=>U("lieu_naissance", e.target.value)} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Document ID *</div>
                  <select className="w-full rounded-lg border px-3 py-2"
                          value={form.doc_type}
                          onChange={(e)=>U("doc_type", e.target.value as any)}>
                    <option value="CIN">CIN</option>
                    <option value="PASSEPORT">Passport (non résident)</option>
                  </select>
                </label>

                <label className="text-sm">
                  <div className="mb-1">Numéro Document ID</div>
                  <input className="w-full rounded-lg border px-3 py-2"
                         value={form.doc_numero ?? ""} onChange={(e)=>U("doc_numero", e.target.value)} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Date Document ID</div>
                  <input type="date" className="w-full rounded-lg border px-3 py-2"
                         value={form.doc_date ?? ""} onChange={(e)=>U("doc_date", e.target.value)} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Délivré à</div>
                  <input className="w-full rounded-lg border px-3 py-2"
                         value={form.doc_delivre_a ?? ""} onChange={(e)=>U("doc_delivre_a", e.target.value)} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Code Postal</div>
                  <input className="w-full rounded-lg border px-3 py-2"
                         value={form.code_postal ?? ""} onChange={(e)=>U("code_postal", e.target.value)} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Ville</div>
                  <input className="w-full rounded-lg border px-3 py-2"
                         value={form.ville ?? ""} onChange={(e)=>U("ville", e.target.value)} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Pays</div>
                  <select className="w-full rounded-lg border px-3 py-2"
                          value={form.pays ?? ""}
                          onChange={(e)=>U("pays", e.target.value)}>
                    {countryOpts.map((o)=>(
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </label>

                <label className="text-sm">
                  <div className="mb-1">Gsm</div>
                  <input className="w-full rounded-lg border px-3 py-2"
                         value={form.gsm ?? ""} onChange={(e)=>U("gsm", e.target.value)} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Email</div>
                  <input type="email" className="w-full rounded-lg border px-3 py-2"
                         value={form.email ?? ""} onChange={(e)=>U("email", e.target.value)} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Nombre de parts (0–100)</div>
                  <input type="number" min={0} max={100} className="w-full rounded-lg border px-3 py-2"
                         value={form.nombre_parts}
                         onChange={(e)=>U("nombre_parts", Math.max(0, Math.min(100, Number(e.target.value || 0))))} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Fonctionnaire Public</div>
                  <select className="w-full rounded-lg border px-3 py-2"
                          value={String(form.fonctionnaire_public)}
                          onChange={(e)=>U("fonctionnaire_public", e.target.value === "true")}>
                    <option value="false">Non</option>
                    <option value="true">Oui</option>
                  </select>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="rounded-lg border px-3 py-2 text-sm">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editOpen && edit && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Modifier l’associé</h3>
              <button onClick={() => { setEditOpen(false); setEdit(null); }} className="text-sm opacity-70 hover:opacity-100">✕</button>
            </div>

            {editError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {editError}
              </div>
            )}

            <form onSubmit={onEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="text-sm">
                  <div className="mb-1">Type *</div>
                  <select className="w-full rounded-lg border px-3 py-2"
                          value={edit.type}
                          onChange={(e)=>UE("type", e.target.value as any)}>
                    <option value="PARTICULIER">particulier</option>
                    <option value="SOCIETE">société</option>
                  </select>
                </label>

                <label className="text-sm">
                  <div className="mb-1">Âge légal *</div>
                  <select className="w-full rounded-lg border px-3 py-2"
                          value={edit.age_legal}
                          onChange={(e)=>UE("age_legal", e.target.value as any)}>
                    <option value="MAJEUR">Associé Majeur</option>
                    <option value="MINEUR">Associé Mineur</option>
                  </select>
                </label>

                <label className="text-sm">
                  <div className="mb-1">Civilité *</div>
                  <select className="w-full rounded-lg border px-3 py-2"
                          value={edit.civilite}
                          onChange={(e)=>UE("civilite", e.target.value as any)}>
                    <option value="MR">Mr.</option>
                    <option value="MLLE">Mlle</option>
                    <option value="MME">Mme</option>
                  </select>
                </label>

                <label className="text-sm">
                  <div className="mb-1">Prénom</div>
                  <input className="w-full rounded-lg border px-3 py-2"
                         value={edit.prenom ?? ""} onChange={(e)=>UE("prenom", e.target.value)} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Nom</div>
                  <input className="w-full rounded-lg border px-3 py-2"
                         value={edit.nom ?? ""} onChange={(e)=>UE("nom", e.target.value)} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Nationalité</div>
                  <select className="w-full rounded-lg border px-3 py-2"
                          value={edit.nationalite ?? ""}
                          onChange={(e)=>UE("nationalite", e.target.value)}>
                    {countryOpts.map((o)=>(
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </label>

                <label className="text-sm">
                  <div className="mb-1">Date de naissance</div>
                  <input type="date" className="w-full rounded-lg border px-3 py-2"
                         value={edit.date_naissance ?? ""} onChange={(e)=>UE("date_naissance", e.target.value)} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Lieu de naissance</div>
                  <input className="w-full rounded-lg border px-3 py-2"
                         value={edit.lieu_naissance ?? ""} onChange={(e)=>UE("lieu_naissance", e.target.value)} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Document ID *</div>
                  <select className="w-full rounded-lg border px-3 py-2"
                          value={edit.doc_type}
                          onChange={(e)=>UE("doc_type", e.target.value as any)}>
                    <option value="CIN">CIN</option>
                    <option value="PASSEPORT">Passport (non résident)</option>
                  </select>
                </label>

                <label className="text-sm">
                  <div className="mb-1">Numéro Document ID</div>
                  <input className="w-full rounded-lg border px-3 py-2"
                         value={edit.doc_numero ?? ""} onChange={(e)=>UE("doc_numero", e.target.value)} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Date Document ID</div>
                  <input type="date" className="w-full rounded-lg border px-3 py-2"
                         value={edit.doc_date ?? ""} onChange={(e)=>UE("doc_date", e.target.value)} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Délivré à</div>
                  <input className="w-full rounded-lg border px-3 py-2"
                         value={edit.doc_delivre_a ?? ""} onChange={(e)=>UE("doc_delivre_a", e.target.value)} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Code Postal</div>
                  <input className="w-full rounded-lg border px-3 py-2"
                         value={edit.code_postal ?? ""} onChange={(e)=>UE("code_postal", e.target.value)} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Ville</div>
                  <input className="w-full rounded-lg border px-3 py-2"
                         value={edit.ville ?? ""} onChange={(e)=>UE("ville", e.target.value)} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Pays</div>
                  <select className="w-full rounded-lg border px-3 py-2"
                          value={edit.pays ?? ""}
                          onChange={(e)=>UE("pays", e.target.value)}>
                    {countryOpts.map((o)=>(
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </label>

                <label className="text-sm">
                  <div className="mb-1">Gsm</div>
                  <input className="w-full rounded-lg border px-3 py-2"
                         value={edit.gsm ?? ""} onChange={(e)=>UE("gsm", e.target.value)} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Email</div>
                  <input type="email" className="w-full rounded-lg border px-3 py-2"
                         value={edit.email ?? ""} onChange={(e)=>UE("email", e.target.value)} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Nombre de parts (0–100)</div>
                  <input type="number" min={0} max={100} className="w-full rounded-lg border px-3 py-2"
                         value={edit.nombre_parts ?? 0}
                         onChange={(e)=>UE("nombre_parts", Math.max(0, Math.min(100, Number(e.target.value || 0))))} />
                </label>

                <label className="text-sm">
                  <div className="mb-1">Fonctionnaire Public</div>
                  <select className="w-full rounded-lg border px-3 py-2"
                          value={String(edit.fonctionnaire_public)}
                          onChange={(e)=>UE("fonctionnaire_public", e.target.value === "true")}>
                    <option value="false">Non</option>
                    <option value="true">Oui</option>
                  </select>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setEditOpen(false); setEdit(null); }} className="rounded-lg border px-3 py-2 text-sm">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
                >
                  {savingEdit ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
