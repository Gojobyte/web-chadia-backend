import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// --------------------------------------------------------------------------
// Client Prisma Singleton (Lazy)
// --------------------------------------------------------------------------
// Le client se cree seulement au premier appel, pas au demarrage.
// C'est important car pendant le build sur Railway, DATABASE_URL
// n'est pas disponible. Si on cree le client au demarrage, ca plante.
// --------------------------------------------------------------------------

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaPg(url);
  return new PrismaClient({ adapter });
}

// "get prisma" = le client est cree seulement quand on y accede
// Pas au moment ou le fichier est importe
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    return Reflect.get(globalForPrisma.prisma, prop);
  },
});
