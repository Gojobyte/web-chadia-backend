import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { logActivity } from "@/lib/logger";
import { success, created, error } from "@/lib/utils/api-response";
import { createMembreSchema } from "@/lib/schemas/equipe";

// GET /api/admin/equipe — Liste (Employe+)
export async function GET() {
  const result = await requireRole("EMPLOYE");
  if (result.error) return result.error;

  const membres = await prisma.membreEquipe.findMany({
    orderBy: { ordre: "asc" },
  });

  return success({ membres });
}

// POST /api/admin/equipe — Creer (Admin+)
export async function POST(request: Request) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;

  const body = await request.json();
  const parsed = createMembreSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 400);

  const { consentDate, ...data } = parsed.data;

  const membre = await prisma.membreEquipe.create({
    data: {
      ...data,
      consentDate: consentDate ? new Date(consentDate) : null,
    },
  });

  await logActivity({
    userId: result.user.id,
    action: "CREATE",
    entite: "MembreEquipe",
    entiteId: membre.id,
    details: { nom: membre.nom, poste: membre.poste },
  });

  return created({ membre });
}
