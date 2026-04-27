import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { logActivity } from "@/lib/logger";
import { success, error, notFound } from "@/lib/utils/api-response";
import { updateChiffreSchema } from "@/lib/schemas/chiffre";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;
  const { id } = await params;
  const existing = await prisma.chiffreCle.findUnique({ where: { id } });
  if (!existing) return notFound("Chiffre cle");

  const body = await request.json();
  const parsed = updateChiffreSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 400);

  const chiffre = await prisma.chiffreCle.update({ where: { id }, data: parsed.data });
  await logActivity({ userId: result.user.id, action: "UPDATE", entite: "ChiffreCle", entiteId: id, details: { label: chiffre.label } });
  return success({ chiffre });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;
  const { id } = await params;
  const existing = await prisma.chiffreCle.findUnique({ where: { id } });
  if (!existing) return notFound("Chiffre cle");

  await prisma.chiffreCle.delete({ where: { id } });
  await logActivity({ userId: result.user.id, action: "DELETE", entite: "ChiffreCle", entiteId: id, details: { label: existing.label } });
  return success({ message: "Chiffre cle supprime." });
}
