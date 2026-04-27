import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { success } from "@/lib/utils/api-response";
import { getPagination } from "@/lib/utils/pagination";

// GET /api/admin/logs — Journal d'activite (Super Admin)
export async function GET(request: Request) {
  const result = await requireRole("SUPER_ADMIN");
  if (result.error) return result.error;

  const { skip, take, page } = getPagination(request);

  const [logs, total] = await Promise.all([
    prisma.logActivite.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.logActivite.count(),
  ]);

  return success({ logs, total, page, pageSize: take });
}
