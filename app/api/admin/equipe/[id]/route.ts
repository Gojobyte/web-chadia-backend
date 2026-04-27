import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { logActivity } from "@/lib/logger";
import { success, error, notFound } from "@/lib/utils/api-response";
import { updateMembreSchema } from "@/lib/schemas/equipe";

// PUT /api/admin/equipe/:id — Modifier (Admin+)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;

  const { id } = await params;
  const existing = await prisma.membreEquipe.findUnique({ where: { id } });
  if (!existing) return notFound("Membre");

  const body = await request.json();
  const parsed = updateMembreSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 400);

  const { consentDate, ...data } = parsed.data;
  const updateData: Record<string, unknown> = { ...data };
  if (consentDate !== undefined) {
    updateData.consentDate = consentDate ? new Date(consentDate) : null;
  }

  const membre = await prisma.membreEquipe.update({
    where: { id },
    data: updateData,
  });

  await logActivity({
    userId: result.user.id,
    action: "UPDATE",
    entite: "MembreEquipe",
    entiteId: id,
    details: { nom: membre.nom },
  });

  return success({ membre });
}

// DELETE /api/admin/equipe/:id — Supprimer (Admin+)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;

  const { id } = await params;
  const existing = await prisma.membreEquipe.findUnique({ where: { id } });
  if (!existing) return notFound("Membre");

  await prisma.membreEquipe.delete({ where: { id } });

  await logActivity({
    userId: result.user.id,
    action: "DELETE",
    entite: "MembreEquipe",
    entiteId: id,
    details: { nom: existing.nom },
  });

  return success({ message: "Membre supprime." });
}
