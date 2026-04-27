import { prisma } from "@/lib/prisma";
import { success } from "@/lib/utils/api-response";

// --------------------------------------------------------------------------
// GET /api/public/accueil — Donnees de la homepage
// --------------------------------------------------------------------------
// Remplace accueil.json. Renvoie : hero, chiffres, equipe, partenaires.

export async function GET() {
  const [infos, chiffres, equipe, partenaires] = await Promise.all([
    prisma.infosONG.findUnique({
      where: { id: "singleton" },
      select: {
        heroTitre: true,
        heroTagline: true,
        heroMetaDescription: true,
        precomBadgeVisible: true,
        precomBadgeTexte: true,
        ctaWhatsappMessage: true,
      },
    }),
    prisma.chiffreCle.findMany({ orderBy: { ordre: "asc" } }),
    prisma.membreEquipe.findMany({
      where: { consent: true },
      orderBy: { ordre: "asc" },
      select: { nom: true, poste: true, photo: true, institution: true },
    }),
    prisma.partenaire.findMany({ orderBy: { ordre: "asc" } }),
  ]);

  return success({
    hero: infos
      ? {
          titre: infos.heroTitre,
          tagline: infos.heroTagline,
          metaDescription: infos.heroMetaDescription,
          precomBadge: {
            visible: infos.precomBadgeVisible,
            texte: infos.precomBadgeTexte,
          },
        }
      : null,
    chiffres,
    equipe,
    partenaires,
    ctaBeneficiaires: { whatsappMessage: infos?.ctaWhatsappMessage ?? "" },
  });
}
