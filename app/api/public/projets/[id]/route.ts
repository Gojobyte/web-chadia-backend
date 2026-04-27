import { prisma } from "@/lib/prisma";
import { success, notFound } from "@/lib/utils/api-response";

// GET /api/public/projets/:id — Detail d'un projet

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const projet = await prisma.projet.findUnique({
    where: { id },
    include: {
      domaine: { select: { id: true, titre: true, icone: true } },
      zonesGeographiques: { select: { id: true, nom: true } },
      indicateursImpact: { select: { valeur: true, label: true } },
    },
  });

  if (!projet) return notFound("Projet");

  return success({ projet });
}
