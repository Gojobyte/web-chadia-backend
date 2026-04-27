import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { logActivity } from "@/lib/logger";
import { success, error, notFound } from "@/lib/utils/api-response";
import { updateProjetSchema } from "@/lib/schemas/projet";

// --------------------------------------------------------------------------
// API Admin — Projet par ID
// --------------------------------------------------------------------------
// PUT    /api/admin/projets/:id → Modifier (Admin+)
// DELETE /api/admin/projets/:id → Supprimer (Admin+)
// --------------------------------------------------------------------------

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;

  const { id } = await params;

  const existing = await prisma.projet.findUnique({ where: { id } });
  if (!existing) return notFound("Projet");

  const body = await request.json();
  const parsed = updateProjetSchema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.issues[0].message, 400);
  }

  const { zonesGeographiques, indicateursImpact, dateDebut, dateFin, ...data } =
    parsed.data;

  // Construire les donnees a mettre a jour
  const updateData: Record<string, unknown> = { ...data };
  if (dateDebut) updateData.dateDebut = new Date(dateDebut);
  if (dateFin !== undefined) updateData.dateFin = dateFin ? new Date(dateFin) : null;

  // Mettre a jour les zones geographiques (remplacer toutes les connexions)
  if (zonesGeographiques) {
    updateData.zonesGeographiques = {
      set: zonesGeographiques.map((zoneId) => ({ id: zoneId })),
    };
  }

  const projet = await prisma.projet.update({
    where: { id },
    data: updateData,
    include: {
      domaine: { select: { id: true, titre: true } },
      zonesGeographiques: { select: { id: true, nom: true } },
      indicateursImpact: { select: { id: true, valeur: true, label: true } },
    },
  });

  // Mettre a jour les indicateurs (supprimer les anciens, creer les nouveaux)
  if (indicateursImpact) {
    await prisma.indicateurImpact.deleteMany({ where: { projetId: id } });
    await prisma.indicateurImpact.createMany({
      data: indicateursImpact.map((ind) => ({
        ...ind,
        projetId: id,
      })),
    });
  }

  await logActivity({
    userId: result.user.id,
    action: "UPDATE",
    entite: "Projet",
    entiteId: id,
    details: { titre: projet.titre },
  });

  return success({ projet });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;

  const { id } = await params;

  const existing = await prisma.projet.findUnique({ where: { id } });
  if (!existing) return notFound("Projet");

  // Supprimer les indicateurs lies avant le projet
  await prisma.indicateurImpact.deleteMany({ where: { projetId: id } });
  await prisma.projet.delete({ where: { id } });

  await logActivity({
    userId: result.user.id,
    action: "DELETE",
    entite: "Projet",
    entiteId: id,
    details: { titre: existing.titre },
  });

  return success({ message: "Projet supprime." });
}
