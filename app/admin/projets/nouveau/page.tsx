"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/admin/image-upload";

interface Domaine {
  id: string;
  titre: string;
}

export default function NouveauProjetPage() {
  const router = useRouter();
  const [domaines, setDomaines] = useState<Domaine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    titre: "",
    description: "",
    domaineId: "",
    statut: "en cours",
    dateDebut: "",
    dateFin: "",
    featured: false,
    responsable: "",
    image: "",
  });

  useEffect(() => {
    fetch("/api/admin/domaines")
      .then((r) => r.json())
      .then((d) => setDomaines(d.domaines ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/projets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erreur");
      return;
    }

    router.push("/admin/projets");
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nouveau projet</h1>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
          <input id="titre" type="text" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="domaine" className="block text-sm font-medium text-gray-700 mb-1">Domaine</label>
            <select id="domaine" value={form.domaineId} onChange={(e) => setForm({ ...form, domaineId: e.target.value })} required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Choisir...</option>
              {domaines.map((d) => <option key={d.id} value={d.id}>{d.titre}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="statut" className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select id="statut" value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="en cours">En cours</option>
              <option value="termine">Termine</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700 mb-1">Date de debut</label>
            <input id="dateDebut" type="date" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700 mb-1">Date de fin <span className="text-gray-400">(optionnel)</span></label>
            <input id="dateFin" type="date" value={form.dateFin} onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label htmlFor="responsable" className="block text-sm font-medium text-gray-700 mb-1">Responsable <span className="text-gray-400">(optionnel)</span></label>
          <input id="responsable" type="text" value={form.responsable} onChange={(e) => setForm({ ...form, responsable: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <ImageUpload folder="projets" onUpload={(url) => setForm({ ...form, image: url })} label="Image du projet (optionnel)" />

        <div className="flex items-center gap-2">
          <input id="featured" type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            className="rounded border-gray-300" />
          <label htmlFor="featured" className="text-sm text-gray-700">Mettre en avant sur la homepage</label>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
            {loading ? "Creation..." : "Creer le projet"}
          </button>
          <button type="button" onClick={() => router.push("/admin/projets")}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
