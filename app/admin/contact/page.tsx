"use client";
import { useState, useEffect, useCallback } from "react";

interface Message { id: string; nom: string; email: string; sujet: string; message: string; statut: string; createdAt: string; }
interface ContactInfo { email: string; telephone: string; adresse: string; horaires: string; whatsapp: string; }

export default function ContactPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [msgRes, infoRes] = await Promise.all([
      fetch("/api/admin/messages?pageSize=50"),
      fetch("/api/admin/contact-info"),
    ]);
    if (msgRes.ok) { const d = await msgRes.json(); setMessages(d.messages); }
    if (infoRes.ok) { const d = await infoRes.json(); setContactInfo(d.contact); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function markRead(id: string) {
    await fetch(`/api/admin/messages/${id}/read`, { method: "PUT" }); load();
  }

  async function deleteMsg(id: string) {
    if (!confirm("Supprimer ce message ?")) return;
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" }); load();
  }

  if (loading) return <p className="text-gray-500">Chargement...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Contact & Messages</h1>

      {/* Infos de contact */}
      {contactInfo && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Informations de contact</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div><span className="text-gray-500">Email</span><p className="font-medium">{contactInfo.email}</p></div>
            <div><span className="text-gray-500">Telephone</span><p className="font-medium">{contactInfo.telephone}</p></div>
            <div><span className="text-gray-500">Adresse</span><p className="font-medium">{contactInfo.adresse}</p></div>
            <div><span className="text-gray-500">Horaires</span><p className="font-medium">{contactInfo.horaires}</p></div>
            <div><span className="text-gray-500">WhatsApp</span><p className="font-medium">{contactInfo.whatsapp}</p></div>
          </div>
        </div>
      )}

      {/* Messages */}
      <h2 className="text-lg font-semibold mb-4">Messages recus ({messages.length})</h2>
      <div className="space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`bg-white rounded-lg shadow p-6 ${m.statut === "non_lu" ? "border-l-4 border-blue-500" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900">{m.nom} <span className="text-gray-400 font-normal">({m.email})</span></p>
                <p className="text-sm font-medium text-gray-700 mt-1">{m.sujet}</p>
                <p className="text-sm text-gray-600 mt-2">{m.message}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(m.createdAt).toLocaleString("fr-FR")}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {m.statut === "non_lu" && (
                  <button onClick={() => markRead(m.id)} className="text-blue-600 hover:underline text-sm">Marquer lu</button>
                )}
                <button onClick={() => deleteMsg(m.id)} className="text-red-600 hover:underline text-sm">Supprimer</button>
              </div>
            </div>
          </div>
        ))}
        {messages.length === 0 && <p className="text-gray-500 text-center py-8">Aucun message.</p>}
      </div>
    </div>
  );
}
