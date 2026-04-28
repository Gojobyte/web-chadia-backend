import { requireRole } from "@/lib/auth-guard";
import { success, error } from "@/lib/utils/api-response";
import { generateUploadSignature } from "@/lib/cloudinary";

// --------------------------------------------------------------------------
// POST /api/admin/upload — Generer une signature d'upload Cloudinary
// --------------------------------------------------------------------------
// Le client demande une signature, puis upload directement vers Cloudinary.
// Ca evite que l'image passe par notre serveur (plus rapide, moins de charge).

export async function POST(request: Request) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;

  const body = await request.json();
  const folder = body.folder ?? "general";

  if (!process.env.CLOUDINARY_API_SECRET) {
    return error("Cloudinary n'est pas configure.", 500);
  }

  const signature = generateUploadSignature(folder);
  return success(signature);
}
