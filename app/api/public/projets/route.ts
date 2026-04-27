import { prisma } from "@/lib/prisma";
import { success } from "@/lib/utils/api-response";

// --------------------------------------------------------------------------
// API Publique — Liste des projets
// --------------------------------------------------------------------------
// GET /api/public/projets
//
// Parametres de query optionnels :
//   ?domaine=sante        → filtrer par domaine
//   ?statut=en+cours      → filtrer par statut
//   ?featured=true        → seulement les projets mis en avant
//
// Cette route remplace la lecture de projets.json dans le front V1.
// Pas d'authentification requise — c'est public.
// --------------------------------------------------------------------------

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Construire les filtres depuis les parametres de query
  const where: Record<string, unknown> = {};

  const domaine = searchParams.get("domaine");
  if (domaine) where.domaineId = domaine;

  const statut = searchParams.get("statut");
  if (statut) where.statut = statut;

  const featured = searchParams.get("featured");
  if (featured === "true") where.featured = true;

  const projets = await prisma.projet.findMany({
    where,
    include: {
      domaine: { select: { id: true, titre: true, icone: true } },
      zonesGeographiques: { select: { id: true, nom: true } },
      indicateursImpact: { select: { valeur: true, label: true } },
    },
    orderBy: { dateDebut: "desc" },
  });

  return success({ projets });
}
