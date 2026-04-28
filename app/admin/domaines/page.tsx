"use client";

import { useState, useEffect, useCallback } from "react";

interface Domaine {
  id: string; titre: string; icone: string; description: string;
  descriptionLongue: string; featured: boolean; _count: { projets: number };
}

export default function DomainesPage() {
  const [domaines, setDomaines] = useState<Domaine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ titre: "", icone: "", description: "", descriptionLongue: "", featured: false });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/domaines");
    if (res.ok) { const data = await res.json(); setDomaines(data.domaines); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  function startEdit(d: Domaine) {
    setEditId(d.id);
    setForm({ titre: d.titre, icone: d.icone, description: d.description, descriptionLongue: d.descriptionLongue, featured: d.featured });
    setShowForm(true);
  }

  function resetForm() {
    setEditId(null);
    setForm({ titre: "", icone: "", description: "", descriptionLongue: "", featured: false });
    setShowForm(false); setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setFormLoading(true); setError("");
    const url = editId ? `/api/admin/domaines/${editId}` : "/api/admin/domaines";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json(); setFormLoading(false);
    if (!res.ok) { setError(data.error ?? "Erreur"); return; }
    resetForm(); load();
  }

  async function handleDelete(id: string, titre: string) {
    if (!confirm(`Supprimer le domaine "${titre}" ?`)) return;
    const res = await fetch(`/api/admin/domaines/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else { const data = await res.json(); alert(data.error); }
  }

  if (loading) return <p className="text-gray-500">Chargement...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Domaines d&apos;intervention</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
          {showForm && !editId ? "Annuler" : "Nouveau domaine"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
          <h2 className="text-lg font-semibold">{editId ? "Modifier le domaine" : "Nouveau domaine"}</h2>
          {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Titre</label><input value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Icone (emoji)</label><input value={form.icone} onChange={(e) => setForm({ ...form, icone: e.target.value })} required placeholder="🏥" className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description courte</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description longue</label><textarea value={form.descriptionLongue} onChange={(e) => setForm({ ...form, descriptionLongue: e.target.value })} required rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded border-gray-300" />
            <label className="text-sm text-gray-700">Mettre en avant sur la homepage</label>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={formLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">{formLoading ? "Sauvegarde..." : editId ? "Enregistrer" : "Creer"}</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm">Annuler</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Icone</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Titre</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Projets</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Featured</th>
            <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-200">
            {domaines.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-xl">{d.icone}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{d.titre}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{d._count.projets}</td>
                <td className="px-6 py-4 text-sm">{d.featured ? "Oui" : "—"}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => startEdit(d)} className="text-blue-600 hover:underline text-sm">Modifier</button>
                  <button onClick={() => handleDelete(d.id, d.titre)} className="text-red-600 hover:underline text-sm">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
