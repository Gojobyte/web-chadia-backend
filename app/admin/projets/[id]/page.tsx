"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface Domaine { id: string; titre: string; }

export default function EditProjetPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [domaines, setDomaines] = useState<Domaine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    titre: "", description: "", domaineId: "", statut: "en cours",
    dateDebut: "", dateFin: "", featured: false, responsable: "",
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/projets?pageSize=100`).then(r => r.json()),
      fetch("/api/admin/domaines").then(r => r.json()),
    ]).then(([projetsData, domainesData]) => {
      setDomaines(domainesData.domaines ?? []);
      const projet = projetsData.projets?.find((p: { id: string }) => p.id === id);
      if (projet) {
        setForm({
          titre: projet.titre, description: projet.description,
          domaineId: projet.domaineId ?? projet.domaine?.id ?? "",
          statut: projet.statut, featured: projet.featured,
          responsable: projet.responsable ?? "",
          dateDebut: projet.dateDebut ? new Date(projet.dateDebut).toISOString().split("T")[0] : "",
          dateFin: projet.dateFin ? new Date(projet.dateFin).toISOString().split("T")[0] : "",
        });
      }
      setLoading(false);
    });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError("");
    const res = await fetch(`/api/admin/projets/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Erreur"); return; }
    router.push("/admin/projets");
  }

  if (loading) return <p className="text-gray-500">Chargement...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Modifier le projet</h1>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
          <input value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Domaine</label>
            <select value={form.domaineId} onChange={(e) => setForm({ ...form, domaineId: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="">Choisir...</option>
              {domaines.map((d) => <option key={d.id} value={d.id}>{d.titre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="en cours">En cours</option>
              <option value="termine">Termine</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de debut</label>
            <input type="date" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <input type="date" value={form.dateFin} onChange={(e) => setForm({ ...form, dateFin: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
          <input value={form.responsable} onChange={(e) => setForm({ ...form, responsable: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded border-gray-300" />
          <label className="text-sm text-gray-700">Mettre en avant sur la homepage</label>
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">{saving ? "Sauvegarde..." : "Enregistrer"}</button>
          <button type="button" onClick={() => router.push("/admin/projets")} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">Annuler</button>
        </div>
      </form>
    </div>
  );
}
