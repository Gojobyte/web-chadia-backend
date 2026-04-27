import { prisma } from "@/lib/prisma";
import { success } from "@/lib/utils/api-response";

// GET /api/public/domaines — Liste de tous les domaines

export async function GET() {
  const domaines = await prisma.domaine.findMany({
    include: {
      activitesCles: { orderBy: { ordre: "asc" } },
      indicateursImpact: { select: { valeur: true, label: true } },
      zonesActives: { select: { id: true, nom: true } },
      projets: { select: { id: true, titre: true }, where: { featured: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return success({ domaines });
}
