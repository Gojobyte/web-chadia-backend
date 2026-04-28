"use client";

import { useState, useEffect, useCallback } from "react";

interface Membre { id: string; nom: string; poste: string; photo: string | null; institution: string | null; consent: boolean; ordre: number; }

export default function EquipePage() {
  const [membres, setMembres] = useState<Membre[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ nom: "", poste: "", photo: "", institution: "", consent: false });
  const [formLoading, setFormLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/equipe");
    if (res.ok) { const data = await res.json(); setMembres(data.membres); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  function startEdit(m: Membre) {
    setEditId(m.id);
    setForm({ nom: m.nom, poste: m.poste, photo: m.photo ?? "", institution: m.institution ?? "", consent: m.consent });
    setShowForm(true);
  }

  function resetForm() { setEditId(null); setForm({ nom: "", poste: "", photo: "", institution: "", consent: false }); setShowForm(false); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setFormLoading(true);
    const url = editId ? `/api/admin/equipe/${editId}` : "/api/admin/equipe";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setFormLoading(false);
    if (res.ok) { resetForm(); load(); }
  }

  async function handleDelete(id: string, nom: string) {
    if (!confirm(`Supprimer ${nom} ?`)) return;
    const res = await fetch(`/api/admin/equipe/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  async function toggleConsent(m: Membre) {
    await fetch(`/api/admin/equipe/${m.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consent: !m.consent, consentDate: !m.consent ? new Date().toISOString() : null }),
    });
    load();
  }

  if (loading) return <p className="text-gray-500">Chargement...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Equipe ({membres.length} membres)</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
          {showForm && !editId ? "Annuler" : "Ajouter un membre"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
          <h2 className="text-lg font-semibold">{editId ? "Modifier le membre" : "Ajouter un membre"}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom</label><input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Poste</label><input value={form.poste} onChange={(e) => setForm({ ...form, poste: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Photo (URL)</label><input value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Institution</label><input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
            <label className="text-sm text-gray-700">Consentement pour affichage sur le site</label>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={formLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">{formLoading ? "Sauvegarde..." : editId ? "Enregistrer" : "Ajouter"}</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm">Annuler</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nom</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Poste</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Institution</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Consentement</th>
            <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-200">
            {membres.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{m.nom}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{m.poste}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{m.institution ?? "—"}</td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleConsent(m)} className={`px-2 py-1 rounded-full text-xs font-medium ${m.consent ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {m.consent ? "Oui" : "Non"}
                  </button>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => startEdit(m)} className="text-blue-600 hover:underline text-sm">Modifier</button>
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
