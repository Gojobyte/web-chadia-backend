"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Projet {
  id: string;
  titre: string;
  statut: string;
  featured: boolean;
  updatedAt: string;
  domaine: { id: string; titre: string };
}

export default function ProjetsPage() {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjets = useCallback(async () => {
    const res = await fetch("/api/admin/projets?pageSize=100");
    if (res.ok) {
      const data = await res.json();
      setProjets(data.projets);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadProjets(); }, [loadProjets]);

  async function handleDelete(id: string, titre: string) {
    if (!confirm(`Supprimer le projet "${titre}" ?`)) return;
    const res = await fetch(`/api/admin/projets/${id}`, { method: "DELETE" });
    if (res.ok) loadProjets();
    else alert("Erreur lors de la suppression.");
  }

  if (loading) return <p className="text-gray-500">Chargement...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projets</h1>
        <Link
          href="/admin/projets/nouveau"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          Nouveau projet
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Titre</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Domaine</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Featured</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {projets.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.titre}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.domaine.titre}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    p.statut === "en cours" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {p.statut}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{p.featured ? "Oui" : "—"}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <Link href={`/admin/projets/${p.id}`} className="text-blue-600 hover:underline text-sm">
                    Modifier
                  </Link>
                  <button onClick={() => handleDelete(p.id, p.titre)} className="text-red-600 hover:underline text-sm">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {projets.length === 0 && (
          <p className="text-center text-gray-500 py-8">Aucun projet.</p>
        )}
      </div>
    </div>
  );
}
