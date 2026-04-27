import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { logActivity } from "@/lib/logger";
import { success, created, error } from "@/lib/utils/api-response";
import { createDomaineSchema } from "@/lib/schemas/domaine";

// GET /api/admin/domaines — Liste (Employe+)
export async function GET() {
  const result = await requireRole("EMPLOYE");
  if (result.error) return result.error;

  const domaines = await prisma.domaine.findMany({
    include: {
      activitesCles: { orderBy: { ordre: "asc" } },
      indicateursImpact: { select: { id: true, valeur: true, label: true } },
      zonesActives: { select: { id: true, nom: true } },
      _count: { select: { projets: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return success({ domaines });
}

// POST /api/admin/domaines — Creer (Admin+)
export async function POST(request: Request) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;

  const body = await request.json();
  const parsed = createDomaineSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 400);

  const { activitesCles, zonesActives, indicateursImpact, ...data } = parsed.data;

  const domaine = await prisma.domaine.create({
    data: {
      ...data,
      activitesCles: {
        create: activitesCles.map((label, i) => ({ label, ordre: i })),
      },
      zonesActives: { connect: zonesActives.map((id) => ({ id })) },
      indicateursImpact: { create: indicateursImpact },
    },
  });

  await logActivity({
    userId: result.user.id,
    action: "CREATE",
    entite: "Domaine",
    entiteId: domaine.id,
    details: { titre: domaine.titre },
  });

  return created({ domaine });
}
