import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { logActivity } from "@/lib/logger";
import { success, created, error } from "@/lib/utils/api-response";
import { createProjetSchema } from "@/lib/schemas/projet";
import { getPagination } from "@/lib/utils/pagination";

// --------------------------------------------------------------------------
// API Admin — Projets
// --------------------------------------------------------------------------
// GET  /api/admin/projets → Liste paginee (Employe+)
// POST /api/admin/projets → Creer un projet (Admin+)
// --------------------------------------------------------------------------

export async function GET(request: Request) {
  const result = await requireRole("EMPLOYE");
  if (result.error) return result.error;

  const { skip, take, page } = getPagination(request);
  const { searchParams } = new URL(request.url);

  const where: Record<string, unknown> = {};
  const domaine = searchParams.get("domaine");
  if (domaine) where.domaineId = domaine;
  const statut = searchParams.get("statut");
  if (statut) where.statut = statut;

  const [projets, total] = await Promise.all([
    prisma.projet.findMany({
      where,
      include: {
        domaine: { select: { id: true, titre: true } },
        zonesGeographiques: { select: { id: true, nom: true } },
        indicateursImpact: { select: { id: true, valeur: true, label: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take,
    }),
    prisma.projet.count({ where }),
  ]);

  return success({ projets, total, page, pageSize: take });
}

export async function POST(request: Request) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;

  const body = await request.json();
  const parsed = createProjetSchema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.issues[0].message, 400);
  }

  const { zonesGeographiques, indicateursImpact, dateDebut, dateFin, ...data } =
    parsed.data;

  const projet = await prisma.projet.create({
    data: {
      ...data,
      dateDebut: new Date(dateDebut),
      dateFin: dateFin ? new Date(dateFin) : null,
      createdById: result.user.id,
      zonesGeographiques: {
        connect: zonesGeographiques.map((id) => ({ id })),
      },
      indicateursImpact: {
        create: indicateursImpact,
      },
    },
    include: {
      domaine: { select: { id: true, titre: true } },
      zonesGeographiques: { select: { id: true, nom: true } },
      indicateursImpact: { select: { id: true, valeur: true, label: true } },
    },
  });

  await logActivity({
    userId: result.user.id,
    action: "CREATE",
    entite: "Projet",
    entiteId: projet.id,
    details: { titre: projet.titre },
  });

  return created({ projet });
}
