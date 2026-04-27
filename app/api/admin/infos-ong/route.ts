import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { logActivity } from "@/lib/logger";
import { success, error } from "@/lib/utils/api-response";
import { updateInfosONGSchema } from "@/lib/schemas/contact";

// GET /api/admin/infos-ong — Lire (Employe+)
export async function GET() {
  const result = await requireRole("EMPLOYE");
  if (result.error) return result.error;

  const infos = await prisma.infosONG.findUnique({
    where: { id: "singleton" },
    include: { valeurs: { orderBy: { ordre: "asc" } } },
  });

  return success({ infos });
}

// PUT /api/admin/infos-ong — Modifier (Admin+)
export async function PUT(request: Request) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;

  const body = await request.json();
  const parsed = updateInfosONGSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 400);

  const { valeurs, ...data } = parsed.data;

  const infos = await prisma.infosONG.upsert({
    where: { id: "singleton" },
    update: { ...data, updatedById: result.user.id },
    create: { id: "singleton", ...data, updatedById: result.user.id },
  });

  // Remplacer les valeurs si fournies
  if (valeurs) {
    await prisma.valeur.deleteMany({ where: { infosONGId: "singleton" } });
    await prisma.valeur.createMany({
      data: valeurs.map((v, i) => ({
        titre: v.titre,
        description: v.description,
        ordre: i,
        infosONGId: "singleton",
      })),
    });
  }

  await logActivity({
    userId: result.user.id, action: "UPDATE", entite: "InfosONG",
    entiteId: "singleton", details: data,
  });

  return success({ infos });
}
