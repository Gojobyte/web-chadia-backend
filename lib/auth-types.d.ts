import type { Role } from "@/app/generated/prisma/client";

// --------------------------------------------------------------------------
// Extension des types NextAuth
// --------------------------------------------------------------------------
// Par defaut, NextAuth ne connait que : name, email, image.
// On ajoute "id" et "role" pour pouvoir les utiliser dans session.user
//
// C'est un fichier de declaration TypeScript (.d.ts) — il ne contient
// pas de code, juste des types. Il dit a TypeScript :
// "Hey, quand tu vois session.user, il y a aussi id et role !"
// --------------------------------------------------------------------------

declare module "next-auth" {
  interface User {
    role?: Role;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
  }
}
