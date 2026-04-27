import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// --------------------------------------------------------------------------
// Client Prisma Singleton
// --------------------------------------------------------------------------
// Pourquoi un "singleton" ?
//
// En developpement, Next.js recharge souvent le code (hot reload).
// Sans singleton, chaque rechargement creerait une NOUVELLE connexion
// a la base de donnees. Au bout de quelques minutes, tu aurais des
// dizaines de connexions ouvertes → la BDD refuserait les nouvelles.
//
// Le singleton stocke le client Prisma dans une variable globale.
// Comme ca, meme apres un rechargement, on reutilise la meme connexion.
// --------------------------------------------------------------------------

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
