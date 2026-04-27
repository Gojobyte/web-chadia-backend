"use client";
import { useState, useEffect } from "react";

export default function AProposPage() {
  const [form, setForm] = useState({
    heroTitre: "", heroTagline: "", heroMetaDescription: "",
    precomBadgeVisible: true, precomBadgeTexte: "",
    histoire: "", vision: "", mission: "", ctaWhatsappMessage: "",
    statutLegalNumero: "", statutLegalDate: "", statutLegalAutorite: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/infos-ong").then(r => r.json()).then(d => {
      if (d.infos) {
        const i = d.infos;
        setForm({
          heroTitre: i.heroTitre, heroTagline: i.heroTagline, heroMetaDescription: i.heroMetaDescription,
          precomBadgeVisible: i.precomBadgeVisible, precomBadgeTexte: i.precomBadgeTexte,
          histoire: i.histoire, vision: i.vision, mission: i.mission, ctaWhatsappMessage: i.ctaWhatsappMessage,
          statutLegalNumero: i.statutLegalNumero, statutLegalDate: i.statutLegalDate, statutLegalAutorite: i.statutLegalAutorite,
        });
      }
      setLoading(false);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMessage("");
    const res = await fetch("/api/admin/infos-ong", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setMessage(res.ok ? "Enregistre !" : "Erreur lors de la sauvegarde.");
  }

  if (loading) return <p className="text-gray-500">Chargement...</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">A propos & Hero</h1>
      {message && <div className={`mb-4 p-3 rounded text-sm ${message.includes("Enregistre") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{message}</div>}
      <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6 space-y-6">
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-gray-800">Hero (Homepage)</legend>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Titre</label><input value={form.heroTitre} onChange={(e) => setForm({...form, heroTitre: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label><input value={form.heroTagline} onChange={(e) => setForm({...form, heroTagline: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Meta description</label><input value={form.heroMetaDescription} onChange={(e) => setForm({...form, heroMetaDescription: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.precomBadgeVisible} onChange={(e) => setForm({...form, precomBadgeVisible: e.target.checked})} />
            <label className="text-sm text-gray-700">Afficher le badge PRECOM</label>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Texte badge PRECOM</label><input value={form.precomBadgeTexte} onChange={(e) => setForm({...form, precomBadgeTexte: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-gray-800">A propos</legend>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Histoire</label><textarea value={form.histoire} onChange={(e) => setForm({...form, histoire: e.target.value})} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Vision</label><textarea value={form.vision} onChange={(e) => setForm({...form, vision: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Mission</label><textarea value={form.mission} onChange={(e) => setForm({...form, mission: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-gray-800">Statut legal</legend>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">N° enregistrement</label><input value={form.statutLegalNumero} onChange={(e) => setForm({...form, statutLegalNumero: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input value={form.statutLegalDate} onChange={(e) => setForm({...form, statutLegalDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Autorite</label><input value={form.statutLegalAutorite} onChange={(e) => setForm({...form, statutLegalAutorite: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          </div>
        </fieldset>

        <div><label className="block text-sm font-medium text-gray-700 mb-1">Message WhatsApp CTA</label><input value={form.ctaWhatsappMessage} onChange={(e) => setForm({...form, ctaWhatsappMessage: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>

        <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
          {saving ? "Sauvegarde..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
