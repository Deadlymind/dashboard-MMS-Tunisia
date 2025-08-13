"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { V1, getClientObjets, createClientObjet, deleteClientObjet, jfetch } from "@/lib/api";

type Objet = {
  id: number;
  code?: number;
  nomination: string;
  agrement: boolean;
  client: number;
  created_at?: string;
};

type SocialOption = { id?: number; nomination: string };

export default function ObjetSocial({ clientId }: { clientId: string }) {
  const [items, setItems] = useState<Objet[]>([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [open, setOpen] = useState(false);
  const [nomination, setNomination] = useState("");
  const [agrement, setAgrement] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // options (from backend list; fallback to static)
  const [options, setOptions] = useState<SocialOption[]>([]);

  async function load() {
    setLoading(true);
    const list = await getClientObjets(clientId);
    setItems(Array.isArray(list) ? list : []);
    setLoading(false);
  }

  async function loadOptions() {
    try {
      const data: any[] = await jfetch(`${V1}/exploitation/objets-sociaux/`);
      const names = Array.isArray(data)
        ? data.map((o) => ({ id: o.id, nomination: o.nomination }))
        : [];
      setOptions(names);
    } catch {
      // fallback minimal list
      setOptions([
        { nomination: "Activités informatiques" },
        { nomination: "Services Agricoles" },
        { nomination: "Consulting Marketing et Commercial" },
      ]);
    }
  }

  useEffect(() => { load(); loadOptions(); }, [clientId]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = { nomination: nomination.trim(), agrement };
      if (!body.nomination) throw new Error("La nomination est requise.");
      await createClientObjet(clientId, body);
      setOpen(false);
      setNomination("");
      setAgrement(false);
      await load();
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'ajout.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Supprimer cet objet social ?")) return;
    await deleteClientObjet(clientId, id);
    await load();
  }

  return (
    <section className="space-y-4">
      {/* Header with right-aligned buttons */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Objet social</h2>
        <div className="flex gap-2">
          <Link
            href="https://sms-tunisia.com/professional/companysetting/socialobject"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
            title="Ouvrir les paramètres des objets sociaux"
          >
            Paramètres
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center rounded-lg bg-black text-white px-3 py-2 text-sm hover:opacity-90"
          >
            + Ajouter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Nomination</th>
              <th className="px-4 py-3">Avec agrément</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-4" colSpan={4}>Chargement…</td></tr>
            ) : (items?.length ?? 0) === 0 ? (
              <tr><td className="px-4 py-4" colSpan={4}>Aucun objet social.</td></tr>
            ) : (
              items.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="px-4 py-3">{it.code ?? it.id}</td>
                  <td className="px-4 py-3">{it.nomination}</td>
                  <td className="px-4 py-3">{it.agrement ? "Oui" : "Non"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onDelete(it.id)}
                      className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Ajouter un objet social</h3>
              <button onClick={() => setOpen(false)} className="text-sm opacity-70 hover:opacity-100">✕</button>
            </div>

            {error && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={onCreate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Nomination *</label>
                <select
                  value={nomination}
                  onChange={(e) => setNomination(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="">Sélectionnez un objet social</option>
                  {options.map((o, i) => (
                    <option key={`${o.id ?? i}-${o.nomination}`} value={o.nomination}>
                      {o.nomination}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Avec Agrément *</label>
                <select
                  value={String(agrement)}
                  onChange={(e) => setAgrement(e.target.value === "true")}
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="false">Non</option>
                  <option value="true">Oui</option>
                </select>
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
    </section>
  );
}
