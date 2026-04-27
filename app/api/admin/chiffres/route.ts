import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { logActivity } from "@/lib/logger";
import { success, created, error } from "@/lib/utils/api-response";
import { createChiffreSchema } from "@/lib/schemas/chiffre";

export async function GET() {
  const result = await requireRole("EMPLOYE");
  if (result.error) return result.error;
  const chiffres = await prisma.chiffreCle.findMany({ orderBy: { ordre: "asc" } });
  return success({ chiffres });
}

export async function POST(request: Request) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;

  // Max 6 chiffres cles
  const count = await prisma.chiffreCle.count();
  if (count >= 6) return error("Maximum 6 chiffres cles autorises.", 400);

  const body = await request.json();
  const parsed = createChiffreSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 400);

  const chiffre = await prisma.chiffreCle.create({ data: parsed.data });
  await logActivity({ userId: result.user.id, action: "CREATE", entite: "ChiffreCle", entiteId: chiffre.id, details: { label: chiffre.label } });
  return created({ chiffre });
}
