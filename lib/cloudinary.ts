import { v2 as cloudinary } from "cloudinary";

// --------------------------------------------------------------------------
// Configuration Cloudinary — Lazy init
// --------------------------------------------------------------------------
// Cloudinary stocke les images (photos equipe, logos partenaires, etc.)
// On genere une "signature" cote serveur pour que le client puisse
// uploader directement vers Cloudinary sans exposer l'API Secret.
// --------------------------------------------------------------------------

let configured = false;

function ensureConfigured() {
  if (configured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  configured = true;
}

/**
 * Genere une signature pour un upload direct depuis le navigateur.
 * Le client envoie l'image directement a Cloudinary (pas via notre serveur).
 */
export function generateUploadSignature(folder: string) {
  ensureConfigured();

  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    timestamp,
    folder: `chadia/${folder}`,
    transformation: "c_limit,w_800,h_800,q_auto,f_auto", // Max 800x800, optimise
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    folder: `chadia/${folder}`,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
  };
}
