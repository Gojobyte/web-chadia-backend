"use client";
import { useState, useEffect, useCallback } from "react";

interface Chiffre { id: string; valeur: string; unite: string | null; label: string; }

export default function ChiffresPage() {
  const [items, setItems] = useState<Chiffre[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ valeur: "", unite: "", label: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/chiffres");
    if (res.ok) { const data = await res.json(); setItems(data.chiffres); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  function startEdit(c: Chiffre) { setEditId(c.id); setForm({ valeur: c.valeur, unite: c.unite ?? "", label: c.label }); setShowForm(true); }
  function resetForm() { setEditId(null); setForm({ valeur: "", unite: "", label: "" }); setShowForm(false); setError(""); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setFormLoading(true); setError("");
    const url = editId ? `/api/admin/chiffres/${editId}` : "/api/admin/chiffres";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json(); setFormLoading(false);
    if (!res.ok) { setError(data.error); return; }
    resetForm(); load();
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
        {(items.length < 6 || editId) && (
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">{showForm && !editId ? "Annuler" : "Ajouter"}</button>
        )}
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
          <h2 className="text-lg font-semibold">{editId ? "Modifier" : "Ajouter un chiffre"}</h2>
          {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Valeur</label><input value={form.valeur} onChange={(e) => setForm({ ...form, valeur: e.target.value })} required placeholder="568M+" className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Unite (opt.)</label><input value={form.unite} onChange={(e) => setForm({ ...form, unite: e.target.value })} placeholder="FCFA" className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Label</label><input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required placeholder="Budget total gere" className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={formLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">{formLoading ? "Sauvegarde..." : editId ? "Enregistrer" : "Ajouter"}</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm">Annuler</button>
          </div>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((c) => (
          <div key={c.id} className="bg-white rounded-lg shadow p-6">
            <p className="text-3xl font-bold text-gray-900">{c.valeur} {c.unite && <span className="text-lg text-gray-500">{c.unite}</span>}</p>
            <p className="text-sm text-gray-600 mt-1">{c.label}</p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => startEdit(c)} className="text-blue-600 hover:underline text-xs">Modifier</button>
              <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline text-xs">Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
