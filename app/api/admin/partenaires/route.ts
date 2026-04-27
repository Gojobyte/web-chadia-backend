import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { logActivity } from "@/lib/logger";
import { success, created, error } from "@/lib/utils/api-response";
import { createPartenaireSchema } from "@/lib/schemas/partenaire";

export async function GET() {
  const result = await requireRole("EMPLOYE");
  if (result.error) return result.error;
  const partenaires = await prisma.partenaire.findMany({ orderBy: { ordre: "asc" } });
  return success({ partenaires });
}

export async function POST(request: Request) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;
  const body = await request.json();
  const parsed = createPartenaireSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 400);

  const partenaire = await prisma.partenaire.create({ data: parsed.data });

  await logActivity({
    userId: result.user.id, action: "CREATE", entite: "Partenaire",
    entiteId: partenaire.id, details: { nom: partenaire.nom },
  });
  return created({ partenaire });
}
