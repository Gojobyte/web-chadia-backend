import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { success } from "@/lib/utils/api-response";
import { getPagination } from "@/lib/utils/pagination";

// GET /api/admin/messages — Liste des messages recus (Employe+)
export async function GET(request: Request) {
  const result = await requireRole("EMPLOYE");
  if (result.error) return result.error;

  const { skip, take, page } = getPagination(request);
  const { searchParams } = new URL(request.url);
  const statut = searchParams.get("statut");

  const where: Record<string, unknown> = {};
  if (statut) where.statut = statut;

  const [messages, total] = await Promise.all([
    prisma.messageContact.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.messageContact.count({ where }),
  ]);

  return success({ messages, total, page, pageSize: take });
}
