"use client";

import { useState, useEffect, useCallback } from "react";

interface Membre { id: string; nom: string; poste: string; consent: boolean; ordre: number; }

export default function EquipePage() {
  const [membres, setMembres] = useState<Membre[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: "", poste: "", consent: false });
  const [formLoading, setFormLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/equipe");
    if (res.ok) { const data = await res.json(); setMembres(data.membres); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    const res = await fetch("/api/admin/equipe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setFormLoading(false);
    if (res.ok) { setForm({ nom: "", poste: "", consent: false }); setShowForm(false); load(); }
  }

  async function handleDelete(id: string, nom: string) {
    if (!confirm(`Supprimer ${nom} ?`)) return;
    const res = await fetch(`/api/admin/equipe/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  if (loading) return <p className="text-gray-500">Chargement...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Equipe</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
          {showForm ? "Annuler" : "Ajouter un membre"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input id="nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="poste" className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
              <input id="poste" value={form.poste} onChange={(e) => setForm({ ...form, poste: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input id="consent" type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
            <label htmlFor="consent" className="text-sm text-gray-700">Consentement pour affichage sur le site</label>
          </div>
          <button type="submit" disabled={formLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm">
            {formLoading ? "Ajout..." : "Ajouter"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Poste</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Consentement</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {membres.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{m.nom}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{m.poste}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs ${m.consent ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{m.consent ? "Oui" : "Non"}</span></td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(m.id, m.nom)} className="text-red-600 hover:underline text-sm">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
