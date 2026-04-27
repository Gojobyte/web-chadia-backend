"use client";

import { useState, useEffect, useCallback } from "react";

interface Domaine {
  id: string;
  titre: string;
  icone: string;
  featured: boolean;
  _count: { projets: number };
}

export default function DomainesPage() {
  const [domaines, setDomaines] = useState<Domaine[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/domaines");
    if (res.ok) { const data = await res.json(); setDomaines(data.domaines); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string, titre: string) {
    if (!confirm(`Supprimer le domaine "${titre}" ?`)) return;
    const res = await fetch(`/api/admin/domaines/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else { const data = await res.json(); alert(data.error); }
  }

  if (loading) return <p className="text-gray-500">Chargement...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Domaines d&apos;intervention</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Icone</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Titre</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Projets</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Featured</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {domaines.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-xl">{d.icone}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{d.titre}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{d._count.projets}</td>
                <td className="px-6 py-4 text-sm">{d.featured ? "Oui" : "—"}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(d.id, d.titre)} className="text-red-600 hover:underline text-sm">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
