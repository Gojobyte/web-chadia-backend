import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { logActivity } from "@/lib/logger";
import { success, error } from "@/lib/utils/api-response";
import { updateContactInfoSchema } from "@/lib/schemas/contact";

// GET /api/admin/contact-info — Lire (Employe+)
export async function GET() {
  const result = await requireRole("EMPLOYE");
  if (result.error) return result.error;
  const contact = await prisma.contactInfo.findUnique({ where: { id: "singleton" } });
  return success({ contact });
}

// PUT /api/admin/contact-info — Modifier (Admin+)
export async function PUT(request: Request) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;

  const body = await request.json();
  const parsed = updateContactInfoSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 400);

  const contact = await prisma.contactInfo.upsert({
    where: { id: "singleton" },
    update: { ...parsed.data, updatedById: result.user.id },
    create: { id: "singleton", ...parsed.data, updatedById: result.user.id },
  });

  await logActivity({ userId: result.user.id, action: "UPDATE", entite: "ContactInfo", entiteId: "singleton", details: parsed.data });
  return success({ contact });
}
