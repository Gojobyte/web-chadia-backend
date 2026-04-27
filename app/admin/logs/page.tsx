"use client";
import { useState, useEffect, useCallback } from "react";

interface Log { id: string; action: string; entite: string; entiteId: string; createdAt: string; user: { name: string; email: string }; }

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/logs?pageSize=50");
    if (res.ok) { const data = await res.json(); setLogs(data.logs); }
    else if (res.status === 403) setError("Acces reserve au Super Admin.");
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="text-gray-500">Chargement...</p>;
  if (error) return <div className="bg-red-50 text-red-700 p-4 rounded">{error}</div>;

  const actionLabels: Record<string, string> = { CREATE: "Creation", UPDATE: "Modification", DELETE: "Suppression" };
  const actionColors: Record<string, string> = { CREATE: "bg-green-100 text-green-800", UPDATE: "bg-blue-100 text-blue-800", DELETE: "bg-red-100 text-red-800" };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Journal d&apos;activite</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Entite</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(l.createdAt).toLocaleString("fr-FR")}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{l.user.name}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${actionColors[l.action] ?? ""}`}>{actionLabels[l.action] ?? l.action}</span></td>
                <td className="px-6 py-4 text-sm text-gray-600">{l.entite}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <p className="text-center text-gray-500 py-8">Aucune activite.</p>}
      </div>
    </div>
  );
}
