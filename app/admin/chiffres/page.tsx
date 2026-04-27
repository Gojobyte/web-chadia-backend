"use client";
import { useState, useEffect, useCallback } from "react";

interface Chiffre { id: string; valeur: string; unite: string | null; label: string; }

export default function ChiffresPage() {
  const [items, setItems] = useState<Chiffre[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ valeur: "", unite: "", label: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/chiffres");
    if (res.ok) { const data = await res.json(); setItems(data.chiffres); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setFormLoading(true); setError("");
    const res = await fetch("/api/admin/chiffres", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json(); setFormLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setForm({ valeur: "", unite: "", label: "" }); setShowForm(false); load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce chiffre ?")) return;
    await fetch(`/api/admin/chiffres/${id}`, { method: "DELETE" }); load();
  }

  if (loading) return <p className="text-gray-500">Chargement...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chiffres cles</h1>
          <p className="text-sm text-gray-500">{items.length}/6 maximum</p>
        </div>
        {items.length < 6 && (
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">{showForm ? "Annuler" : "Ajouter"}</button>
        )}
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Valeur</label><input value={form.valeur} onChange={(e) => setForm({ ...form, valeur: e.target.value })} required placeholder="568M+" className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Unite (opt.)</label><input value={form.unite} onChange={(e) => setForm({ ...form, unite: e.target.value })} placeholder="FCFA" className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Label</label><input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required placeholder="Budget total gere" className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          </div>
          <button type="submit" disabled={formLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">{formLoading ? "Ajout..." : "Ajouter"}</button>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((c) => (
          <div key={c.id} className="bg-white rounded-lg shadow p-6 relative">
            <button onClick={() => handleDelete(c.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-xs">Supprimer</button>
            <p className="text-3xl font-bold text-gray-900">{c.valeur} {c.unite && <span className="text-lg text-gray-500">{c.unite}</span>}</p>
            <p className="text-sm text-gray-600 mt-1">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
