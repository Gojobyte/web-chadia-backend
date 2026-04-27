"use client";
import { useState, useEffect, useCallback } from "react";

interface Partenaire { id: string; nom: string; logo: string; url: string | null; }

export default function PartenairesPage() {
  const [items, setItems] = useState<Partenaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: "", logo: "", url: "" });
  const [formLoading, setFormLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/partenaires");
    if (res.ok) { const data = await res.json(); setItems(data.partenaires); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setFormLoading(true);
    const res = await fetch("/api/admin/partenaires", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setFormLoading(false);
    if (res.ok) { setForm({ nom: "", logo: "", url: "" }); setShowForm(false); load(); }
  }

  async function handleDelete(id: string, nom: string) {
    if (!confirm(`Supprimer ${nom} ?`)) return;
    await fetch(`/api/admin/partenaires/${id}`, { method: "DELETE" }); load();
  }

  if (loading) return <p className="text-gray-500">Chargement...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Partenaires</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">{showForm ? "Annuler" : "Ajouter"}</button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom</label><input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Logo (URL)</label><input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Site web</label><input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          </div>
          <button type="submit" disabled={formLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">{formLoading ? "Ajout..." : "Ajouter"}</button>
        </form>
      )}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nom</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Logo</th>
            <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.nom}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{p.logo}</td>
                <td className="px-6 py-4 text-right"><button onClick={() => handleDelete(p.id, p.nom)} className="text-red-600 hover:underline text-sm">Supprimer</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
