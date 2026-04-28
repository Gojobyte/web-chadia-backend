"use client";
import { useState, useEffect, useCallback } from "react";

interface Message { id: string; nom: string; email: string; sujet: string; message: string; statut: string; createdAt: string; }

export default function ContactPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [editContact, setEditContact] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [contactForm, setContactForm] = useState({ email: "", telephone: "", adresse: "", horaires: "", whatsapp: "" });

  const load = useCallback(async () => {
    const [msgRes, infoRes] = await Promise.all([
      fetch("/api/admin/messages?pageSize=50"),
      fetch("/api/admin/contact-info"),
    ]);
    if (msgRes.ok) { const d = await msgRes.json(); setMessages(d.messages); }
    if (infoRes.ok) { const d = await infoRes.json(); if (d.contact) setContactForm(d.contact); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function saveContact(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setSaveMsg("");
    const res = await fetch("/api/admin/contact-info", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(contactForm) });
    setSaving(false);
    setSaveMsg(res.ok ? "Enregistre !" : "Erreur");
    setEditContact(false);
  }

  async function markRead(id: string) { await fetch(`/api/admin/messages/${id}/read`, { method: "PUT" }); load(); }
  async function deleteMsg(id: string) { if (!confirm("Supprimer ?")) return; await fetch(`/api/admin/messages/${id}`, { method: "DELETE" }); load(); }

  if (loading) return <p className="text-gray-500">Chargement...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Contact & Messages</h1>

      {saveMsg && <div className={`mb-4 p-3 rounded text-sm ${saveMsg.includes("Enregistre") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{saveMsg}</div>}

      {/* Infos de contact */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Informations de contact</h2>
          <button onClick={() => setEditContact(!editContact)} className="text-blue-600 hover:underline text-sm">{editContact ? "Annuler" : "Modifier"}</button>
        </div>
        {editContact ? (
          <form onSubmit={saveContact} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Telephone</label><input value={contactForm.telephone} onChange={(e) => setContactForm({ ...contactForm, telephone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label><input value={contactForm.adresse} onChange={(e) => setContactForm({ ...contactForm, adresse: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Horaires</label><input value={contactForm.horaires} onChange={(e) => setContactForm({ ...contactForm, horaires: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label><input value={contactForm.whatsapp} onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            </div>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">{saving ? "Sauvegarde..." : "Enregistrer"}</button>
          </form>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div><span className="text-gray-500">Email</span><p className="font-medium">{contactForm.email || "—"}</p></div>
            <div><span className="text-gray-500">Telephone</span><p className="font-medium">{contactForm.telephone || "—"}</p></div>
            <div><span className="text-gray-500">Adresse</span><p className="font-medium">{contactForm.adresse || "—"}</p></div>
            <div><span className="text-gray-500">Horaires</span><p className="font-medium">{contactForm.horaires || "—"}</p></div>
            <div><span className="text-gray-500">WhatsApp</span><p className="font-medium">{contactForm.whatsapp || "—"}</p></div>
          </div>
        )}
      </div>

      {/* Messages */}
      <h2 className="text-lg font-semibold mb-4">Messages recus ({messages.length})</h2>
      <div className="space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`bg-white rounded-lg shadow p-6 ${m.statut === "non_lu" ? "border-l-4 border-blue-500" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900">{m.nom} <span className="text-gray-400 font-normal">({m.email})</span></p>
                <p className="text-sm font-medium text-gray-700 mt-1">{m.sujet}</p>
                <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{m.message}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(m.createdAt).toLocaleString("fr-FR")}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {m.statut === "non_lu" && <button onClick={() => markRead(m.id)} className="text-blue-600 hover:underline text-sm">Marquer lu</button>}
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
