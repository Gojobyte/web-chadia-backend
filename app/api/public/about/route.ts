import { prisma } from "@/lib/prisma";
import { success } from "@/lib/utils/api-response";

// GET /api/public/about — Infos a propos (remplace about.json)

export async function GET() {
  const [infos, equipe] = await Promise.all([
    prisma.infosONG.findUnique({
      where: { id: "singleton" },
      include: { valeurs: { orderBy: { ordre: "asc" } } },
    }),
    prisma.membreEquipe.findMany({
      where: { consent: true },
      orderBy: { ordre: "asc" },
    }),
  ]);

  return success({
    histoire: { titre: "Notre histoire", texte: infos?.histoire ?? "" },
    vision: infos?.vision ?? "",
    mission: infos?.mission ?? "",
    valeurs: infos?.valeurs ?? [],
    statutLegal: {
      numeroEnregistrement: infos?.statutLegalNumero ?? "",
      date: infos?.statutLegalDate ?? "",
      autorite: infos?.statutLegalAutorite ?? "",
    },
    equipe,
  });
}
