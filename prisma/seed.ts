// ============================================================
// ONG CHADIA — Script de Seed
// ============================================================
// Ce script importe les donnees des fichiers JSON V1 du front
// dans la base de donnees PostgreSQL.
//
// Usage : npx prisma db seed
//
// Il est IDEMPOTENT = tu peux le lancer plusieurs fois sans
// creer de doublons (il utilise upsert = "cree ou met a jour").
// ============================================================

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { hash } from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

// ------------------------------------------------------------
// 1. Connexion a la base de donnees
// ------------------------------------------------------------

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ------------------------------------------------------------
// 2. Lecture des fichiers JSON du front
// ------------------------------------------------------------
// On lit les fichiers JSON qui sont dans le projet web-chadia (le front).
// Le chemin est relatif : le front est dans ../web-chadia/content/

const CONTENT_DIR = path.join(__dirname, "../../web-chadia/content");

function readJSON<T>(filename: string): T {
  const filePath = path.join(CONTENT_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

// Types pour les fichiers JSON (correspondent aux types du front)
interface JSONProjet {
  id: string;
  titre: string;
  domaine: string;
  statut: "en cours" | "terminé";
  zonesGeographiques: string[];
  dateDebut: string;
  dateFin?: string;
  description: string;
  indicateursImpact: { valeur: string; label: string }[];
  image?: string;
  featured: boolean;
  responsable?: string;
}

interface JSONDomaine {
  id: string;
  titre: string;
  icone: string;
  description: string;
  descriptionLongue: string;
  activitesCles: string[];
  indicateursImpact: { valeur: string; label: string }[];
  zonesActives: string[];
  projetsAssocies: { id: string; titre: string }[];
  featured: boolean;
}

interface JSONAccueil {
  hero: {
    titre: string;
    tagline: string;
    precomBadge: { visible: boolean; texte: string };
    metaDescription: string;
  };
  chiffres: { valeur: string; unite?: string; label: string }[];
  equipe: JSONMembreEquipe[];
  partenaires: { nom: string; logo: string; url?: string }[];
  ctaBeneficiaires: { whatsappMessage: string };
}

interface JSONMembreEquipe {
  nom: string;
  poste: string;
  photo?: string;
  institution?: string;
  consent: boolean;
  consentDate?: string;
}

interface JSONAbout {
  histoire: { titre: string; texte: string };
  vision: string;
  mission: string;
  valeurs: { titre: string; description: string }[];
  statutLegal: {
    numeroEnregistrement: string;
    date: string;
    autorite: string;
  };
  zonesIntervention: string[];
  equipe: JSONMembreEquipe[];
}

interface JSONContact {
  email: string;
  telephone: string;
  adresse: string;
  horaires: string;
  whatsapp: string;
}

// ------------------------------------------------------------
// 3. Fonction principale de seed
// ------------------------------------------------------------

async function main() {
  console.log("🌱 Debut du seed...\n");

  // Lire tous les fichiers JSON
  const accueil = readJSON<JSONAccueil>("accueil.json");
  const domaines = readJSON<JSONDomaine[]>("domaines.json");
  const projets = readJSON<JSONProjet[]>("projets.json");
  const about = readJSON<JSONAbout>("about.json");
  const contact = readJSON<JSONContact>("contact.json");

  // --------------------------------------------------------
  // 3a. Creer le Super Admin initial
  // --------------------------------------------------------
  // On utilise les variables d'environnement pour l'email et le mdp.
  // Le mot de passe est hashe avec bcrypt (jamais stocke en clair !)

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!superAdminEmail || !superAdminPassword) {
    console.warn(
      "⚠️  SUPER_ADMIN_EMAIL ou SUPER_ADMIN_PASSWORD manquant dans .env"
    );
    console.warn("   Le Super Admin ne sera pas cree.\n");
  } else {
    const passwordHash = await hash(superAdminPassword, 12);
    await prisma.user.upsert({
      where: { email: superAdminEmail },
      update: { role: "SUPER_ADMIN" }, // Si existe deja, s'assurer du role
      create: {
        email: superAdminEmail,
        name: "Super Admin",
        passwordHash,
        role: "SUPER_ADMIN",
      },
    });
    console.log(`✅ Super Admin cree : ${superAdminEmail}`);
  }

  // --------------------------------------------------------
  // 3b. Creer les zones geographiques
  // --------------------------------------------------------
  // On collecte toutes les zones depuis les projets, domaines et about,
  // puis on les cree sans doublons.

  const allZones = new Set<string>();

  projets.forEach((p) => p.zonesGeographiques.forEach((z) => allZones.add(z)));
  domaines.forEach((d) => d.zonesActives.forEach((z) => allZones.add(z)));
  about.zonesIntervention.forEach((z) => allZones.add(z));

  const zoneMap = new Map<string, string>(); // nom → id
  for (const nom of allZones) {
    const zone = await prisma.zoneGeographique.upsert({
      where: { nom },
      update: {},
      create: { nom },
    });
    zoneMap.set(nom, zone.id);
  }
  console.log(`✅ ${allZones.size} zones geographiques creees`);

  // --------------------------------------------------------
  // 3c. Creer les domaines d'intervention
  // --------------------------------------------------------
  // Chaque domaine a des activites cles, des indicateurs et des zones.

  const domaineMap = new Map<string, string>(); // id JSON → id BDD

  for (const d of domaines) {
    const domaine = await prisma.domaine.upsert({
      where: { id: d.id }, // On garde l'ID du JSON
      update: {
        titre: d.titre,
        icone: d.icone,
        description: d.description,
        descriptionLongue: d.descriptionLongue,
        featured: d.featured,
      },
      create: {
        id: d.id,
        titre: d.titre,
        icone: d.icone,
        description: d.description,
        descriptionLongue: d.descriptionLongue,
        featured: d.featured,
        zonesActives: {
          connect: d.zonesActives.map((nom) => ({ id: zoneMap.get(nom)! })),
        },
      },
    });

    domaineMap.set(d.id, domaine.id);

    // Creer les activites cles
    // D'abord supprimer les anciennes (pour l'idempotence)
    await prisma.activiteCle.deleteMany({ where: { domaineId: domaine.id } });
    for (let i = 0; i < d.activitesCles.length; i++) {
      await prisma.activiteCle.create({
        data: {
          label: d.activitesCles[i],
          ordre: i,
          domaineId: domaine.id,
        },
      });
    }

    // Creer les indicateurs d'impact du domaine
    await prisma.indicateurImpact.deleteMany({
      where: { domaineId: domaine.id },
    });
    for (const ind of d.indicateursImpact) {
      await prisma.indicateurImpact.create({
        data: {
          valeur: ind.valeur,
          label: ind.label,
          domaineId: domaine.id,
        },
      });
    }
  }
  console.log(`✅ ${domaines.length} domaines crees`);

  // --------------------------------------------------------
  // 3d. Creer les projets
  // --------------------------------------------------------

  for (const p of projets) {
    const projet = await prisma.projet.upsert({
      where: { id: p.id },
      update: {
        titre: p.titre,
        description: p.description,
        statut: p.statut === "terminé" ? "termine" : "en cours",
        dateDebut: new Date(p.dateDebut),
        dateFin: p.dateFin ? new Date(p.dateFin) : null,
        image: p.image ?? null,
        featured: p.featured,
        responsable: p.responsable ?? null,
      },
      create: {
        id: p.id,
        titre: p.titre,
        description: p.description,
        statut: p.statut === "terminé" ? "termine" : "en cours",
        dateDebut: new Date(p.dateDebut),
        dateFin: p.dateFin ? new Date(p.dateFin) : null,
        image: p.image ?? null,
        featured: p.featured,
        responsable: p.responsable ?? null,
        domaineId: domaineMap.get(p.domaine) ?? p.domaine,
        zonesGeographiques: {
          connect: p.zonesGeographiques.map((nom) => ({
            id: zoneMap.get(nom)!,
          })),
        },
      },
    });

    // Indicateurs d'impact du projet
    await prisma.indicateurImpact.deleteMany({
      where: { projetId: projet.id },
    });
    for (const ind of p.indicateursImpact) {
      await prisma.indicateurImpact.create({
        data: {
          valeur: ind.valeur,
          label: ind.label,
          projetId: projet.id,
        },
      });
    }
  }
  console.log(`✅ ${projets.length} projets crees`);

  // --------------------------------------------------------
  // 3e. Creer les membres de l'equipe
  // --------------------------------------------------------
  // On combine les equipes de accueil.json et about.json
  // en evitant les doublons (meme nom + meme poste)

  const allMembers = new Map<string, JSONMembreEquipe>();
  [...about.equipe, ...accueil.equipe].forEach((m) => {
    const key = `${m.nom}|${m.poste}`;
    if (!allMembers.has(key)) {
      allMembers.set(key, m);
    }
  });

  // Supprimer les anciens membres (pour l'idempotence)
  await prisma.membreEquipe.deleteMany();
  let ordreEquipe = 0;
  for (const m of allMembers.values()) {
    await prisma.membreEquipe.create({
      data: {
        nom: m.nom,
        poste: m.poste,
        photo: m.photo ?? null,
        institution: m.institution ?? null,
        consent: m.consent,
        consentDate: m.consentDate ? new Date(m.consentDate) : null,
        ordre: ordreEquipe++,
      },
    });
  }
  console.log(`✅ ${allMembers.size} membres d'equipe crees`);

  // --------------------------------------------------------
  // 3f. Creer les partenaires
  // --------------------------------------------------------

  await prisma.partenaire.deleteMany();
  for (let i = 0; i < accueil.partenaires.length; i++) {
    const p = accueil.partenaires[i];
    await prisma.partenaire.create({
      data: {
        nom: p.nom,
        logo: p.logo,
        url: p.url ?? null,
        ordre: i,
      },
    });
  }
  console.log(`✅ ${accueil.partenaires.length} partenaires crees`);

  // --------------------------------------------------------
  // 3g. Creer les chiffres cles
  // --------------------------------------------------------

  await prisma.chiffreCle.deleteMany();
  for (let i = 0; i < accueil.chiffres.length; i++) {
    const c = accueil.chiffres[i];
    await prisma.chiffreCle.create({
      data: {
        valeur: c.valeur,
        unite: c.unite ?? null,
        label: c.label,
        ordre: i,
      },
    });
  }
  console.log(`✅ ${accueil.chiffres.length} chiffres cles crees`);

  // --------------------------------------------------------
  // 3h. Creer les infos ONG (singleton)
  // --------------------------------------------------------

  // D'abord supprimer les anciennes valeurs
  await prisma.valeur.deleteMany({ where: { infosONGId: "singleton" } });

  await prisma.infosONG.upsert({
    where: { id: "singleton" },
    update: {
      heroTitre: accueil.hero.titre,
      heroTagline: accueil.hero.tagline,
      heroMetaDescription: accueil.hero.metaDescription,
      precomBadgeVisible: accueil.hero.precomBadge.visible,
      precomBadgeTexte: accueil.hero.precomBadge.texte,
      histoire: about.histoire.texte,
      vision: about.vision,
      mission: about.mission,
      statutLegalNumero: about.statutLegal.numeroEnregistrement,
      statutLegalDate: about.statutLegal.date,
      statutLegalAutorite: about.statutLegal.autorite,
      ctaWhatsappMessage: accueil.ctaBeneficiaires.whatsappMessage,
    },
    create: {
      id: "singleton",
      heroTitre: accueil.hero.titre,
      heroTagline: accueil.hero.tagline,
      heroMetaDescription: accueil.hero.metaDescription,
      precomBadgeVisible: accueil.hero.precomBadge.visible,
      precomBadgeTexte: accueil.hero.precomBadge.texte,
      histoire: about.histoire.texte,
      vision: about.vision,
      mission: about.mission,
      statutLegalNumero: about.statutLegal.numeroEnregistrement,
      statutLegalDate: about.statutLegal.date,
      statutLegalAutorite: about.statutLegal.autorite,
      ctaWhatsappMessage: accueil.ctaBeneficiaires.whatsappMessage,
    },
  });

  // Creer les valeurs de l'ONG
  for (let i = 0; i < about.valeurs.length; i++) {
    const v = about.valeurs[i];
    await prisma.valeur.create({
      data: {
        titre: v.titre,
        description: v.description,
        ordre: i,
        infosONGId: "singleton",
      },
    });
  }
  console.log(`✅ Infos ONG creees (${about.valeurs.length} valeurs)`);

  // --------------------------------------------------------
  // 3i. Creer les infos de contact (singleton)
  // --------------------------------------------------------

  await prisma.contactInfo.upsert({
    where: { id: "singleton" },
    update: {
      email: contact.email.trim(),
      telephone: contact.telephone.trim(),
      adresse: contact.adresse.trim(),
      horaires: contact.horaires,
      whatsapp: contact.whatsapp.trim(),
    },
    create: {
      id: "singleton",
      email: contact.email.trim(),
      telephone: contact.telephone.trim(),
      adresse: contact.adresse.trim(),
      horaires: contact.horaires,
      whatsapp: contact.whatsapp.trim(),
    },
  });
  console.log(`✅ Infos de contact creees`);

  console.log("\n🎉 Seed termine avec succes !");
}

// ------------------------------------------------------------
// 4. Execution
// ------------------------------------------------------------

main()
  .catch((e) => {
    console.error("❌ Erreur pendant le seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
