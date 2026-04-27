import { prisma } from "@/lib/prisma";
import { success, notFound } from "@/lib/utils/api-response";

// GET /api/public/domaines/:id — Detail d'un domaine

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const domaine = await prisma.domaine.findUnique({
    where: { id },
    include: {
      activitesCles: { orderBy: { ordre: "asc" } },
      indicateursImpact: { select: { valeur: true, label: true } },
      zonesActives: { select: { id: true, nom: true } },
      projets: {
        select: { id: true, titre: true, statut: true, featured: true },
      },
    },
  });

  if (!domaine) return notFound("Domaine");

  return success({ domaine });
}
