import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { success, notFound } from "@/lib/utils/api-response";

// PUT /api/admin/messages/:id/read — Marquer comme lu (Admin+)
export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;

  const { id } = await params;
  const existing = await prisma.messageContact.findUnique({ where: { id } });
  if (!existing) return notFound("Message");

  const message = await prisma.messageContact.update({
    where: { id },
    data: { statut: "lu", readById: result.user.id, readAt: new Date() },
  });

  return success({ message });
}
