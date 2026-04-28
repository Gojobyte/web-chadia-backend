"use client";

import { useState, useRef } from "react";

// --------------------------------------------------------------------------
// Composant ImageUpload — Upload de photos vers Cloudinary
// --------------------------------------------------------------------------
// Utilisation :
//   <ImageUpload
//     folder="equipe"
//     currentUrl={membre.photo}
//     onUpload={(url) => setForm({ ...form, photo: url })}
//   />
// --------------------------------------------------------------------------

interface ImageUploadProps {
  folder: string;         // Dossier Cloudinary (equipe, partenaires, projets)
  currentUrl?: string;    // URL actuelle de l'image
  onUpload: (url: string) => void; // Callback quand l'upload est termine
  label?: string;
}

export function ImageUpload({ folder, currentUrl, onUpload, label = "Photo" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl ?? "");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verifier le type et la taille
    if (!file.type.startsWith("image/")) {
      setError("Le fichier doit etre une image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas depasser 5 Mo.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      // 1. Demander une signature au serveur
      const sigRes = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });

      if (!sigRes.ok) {
        const data = await sigRes.json();
        throw new Error(data.error ?? "Erreur de signature");
      }

      const { signature, timestamp, folder: cloudFolder, cloudName, apiKey } = await sigRes.json();

      // 2. Uploader directement vers Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", String(timestamp));
      formData.append("folder", cloudFolder);
      formData.append("api_key", apiKey);
      formData.append("transformation", "c_limit,w_800,h_800,q_auto,f_auto");

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!uploadRes.ok) throw new Error("Erreur upload Cloudinary");

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.secure_url;

      setPreview(imageUrl);
      onUpload(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

      <div className="flex items-start gap-4">
        {/* Preview */}
        {preview && (
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex-1">
          {/* Bouton d'upload */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {uploading ? "Upload en cours..." : preview ? "Changer la photo" : "Choisir une photo"}
          </button>

          {/* Ou coller une URL */}
          <input
            type="text"
            value={preview}
            onChange={(e) => { setPreview(e.target.value); onUpload(e.target.value); }}
            placeholder="Ou collez une URL d'image"
            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />

          {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}
