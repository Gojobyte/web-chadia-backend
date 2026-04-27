import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { logActivity } from "@/lib/logger";
import { success, error, notFound } from "@/lib/utils/api-response";
import { updateDomaineSchema } from "@/lib/schemas/domaine";

// PUT /api/admin/domaines/:id — Modifier (Admin+)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;

  const { id } = await params;
  const existing = await prisma.domaine.findUnique({ where: { id } });
  if (!existing) return notFound("Domaine");

  const body = await request.json();
  const parsed = updateDomaineSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 400);

  const { activitesCles, zonesActives, indicateursImpact, ...data } = parsed.data;

  const updateData: Record<string, unknown> = { ...data };

  if (zonesActives) {
    updateData.zonesActives = { set: zonesActives.map((zId) => ({ id: zId })) };
  }

  const domaine = await prisma.domaine.update({
    where: { id },
    data: updateData,
  });

  // Remplacer les activites cles
  if (activitesCles) {
    await prisma.activiteCle.deleteMany({ where: { domaineId: id } });
    await prisma.activiteCle.createMany({
      data: activitesCles.map((label, i) => ({ label, ordre: i, domaineId: id })),
    });
  }

  // Remplacer les indicateurs
  if (indicateursImpact) {
    await prisma.indicateurImpact.deleteMany({ where: { domaineId: id } });
    await prisma.indicateurImpact.createMany({
      data: indicateursImpact.map((ind) => ({ ...ind, domaineId: id })),
    });
  }

  await logActivity({
    userId: result.user.id,
    action: "UPDATE",
    entite: "Domaine",
    entiteId: id,
    details: { titre: domaine.titre },
  });

  return success({ domaine });
}

// DELETE /api/admin/domaines/:id — Supprimer (Admin+)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;

  const { id } = await params;
  const existing = await prisma.domaine.findUnique({
    where: { id },
    include: { _count: { select: { projets: true } } },
  });
  if (!existing) return notFound("Domaine");

  // Empecher la suppression si des projets sont lies
  if (existing._count.projets > 0) {
    return error(
      `Impossible de supprimer : ${existing._count.projets} projet(s) sont lies a ce domaine.`,
      400
    );
  }

  await prisma.activiteCle.deleteMany({ where: { domaineId: id } });
  await prisma.indicateurImpact.deleteMany({ where: { domaineId: id } });
  await prisma.domaine.delete({ where: { id } });

  await logActivity({
    userId: result.user.id,
    action: "DELETE",
    entite: "Domaine",
    entiteId: id,
    details: { titre: existing.titre },
  });

  return success({ message: "Domaine supprime." });
}
