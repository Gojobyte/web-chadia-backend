import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { logActivity } from "@/lib/logger";
import { success, error, notFound } from "@/lib/utils/api-response";
import { updatePartenaireSchema } from "@/lib/schemas/partenaire";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;
  const { id } = await params;
  const existing = await prisma.partenaire.findUnique({ where: { id } });
  if (!existing) return notFound("Partenaire");

  const body = await request.json();
  const parsed = updatePartenaireSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 400);

  const partenaire = await prisma.partenaire.update({ where: { id }, data: parsed.data });

  await logActivity({ userId: result.user.id, action: "UPDATE", entite: "Partenaire", entiteId: id, details: { nom: partenaire.nom } });
  return success({ partenaire });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;
  const { id } = await params;
  const existing = await prisma.partenaire.findUnique({ where: { id } });
  if (!existing) return notFound("Partenaire");

  await prisma.partenaire.delete({ where: { id } });
  await logActivity({ userId: result.user.id, action: "DELETE", entite: "Partenaire", entiteId: id, details: { nom: existing.nom } });
  return success({ message: "Partenaire supprime." });
}
