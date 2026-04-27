import { prisma } from "@/lib/prisma";
import { success } from "@/lib/utils/api-response";

// GET /api/public/contact — Infos de contact (remplace contact.json)

export async function GET() {
  const contact = await prisma.contactInfo.findUnique({
    where: { id: "singleton" },
    select: {
      email: true,
      telephone: true,
      adresse: true,
      horaires: true,
      whatsapp: true,
    },
  });

  return success(contact ?? {});
}
