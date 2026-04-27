import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { success, notFound } from "@/lib/utils/api-response";

// DELETE /api/admin/messages/:id — Supprimer un message (Admin+)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;

  const { id } = await params;
  const existing = await prisma.messageContact.findUnique({ where: { id } });
  if (!existing) return notFound("Message");

  await prisma.messageContact.delete({ where: { id } });
  return success({ message: "Message supprime." });
}
