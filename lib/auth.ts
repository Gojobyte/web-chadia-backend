import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import type { Role } from "@/app/generated/prisma/client";
import type {} from "@/lib/auth-types";

// --------------------------------------------------------------------------
// Configuration NextAuth v5
// --------------------------------------------------------------------------
// NextAuth gere toute l'authentification de l'application.
//
// On configure 2 "providers" (facons de se connecter) :
// 1. Credentials = email + mot de passe
// 2. Google = connexion avec son compte Google
//
// Le PrismaAdapter stocke les sessions et comptes dans la BDD PostgreSQL.
//
// IMPORTANT : La connexion Google ne cree PAS de compte automatiquement.
// Le Super Admin doit d'abord creer le compte avec l'email Google.
// --------------------------------------------------------------------------

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Le PrismaAdapter connecte NextAuth a notre base de donnees
  adapter: PrismaAdapter(prisma),

  // On utilise des JWT (tokens) plutot que des sessions en BDD
  // C'est plus simple et plus rapide
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 heures
  },

  // Pages personnalisees
  pages: {
    signIn: "/admin/login", // Notre page de connexion
  },

  // Les providers = les facons de se connecter
  providers: [
    // --- Provider 1 : Email + Mot de passe ---
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        // Verifier que email et mdp sont fournis
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          return null; // null = connexion refusee
        }

        // Chercher l'utilisateur en BDD
        const user = await prisma.user.findUnique({
          where: { email },
        });

        // Si l'utilisateur n'existe pas ou n'a pas de mot de passe
        if (!user || !user.passwordHash) {
          return null;
        }

        // Comparer le mot de passe saisi avec le hash en BDD
        // compare() retourne true si le mot de passe est correct
        const isValid = await compare(password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        // Connexion reussie ! On renvoie les infos de l'utilisateur
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),

    // --- Provider 2 : Google OAuth ---
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  // Callbacks = fonctions appelees a chaque etape du processus d'auth
  callbacks: {
    // Appelé quand un utilisateur tente de se connecter
    async signIn({ user, account }) {
      // Pour la connexion Google, on verifie que le compte existe deja en BDD
      // (pas de creation automatique — le Super Admin doit d'abord creer le compte)
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          // L'utilisateur n'a pas de compte → connexion refusee
          return false;
        }

        // Mettre a jour le googleId si c'est la premiere connexion Google
        if (!existingUser.googleId && account.providerAccountId) {
          await prisma.user.update({
            where: { email: user.email! },
            data: { googleId: account.providerAccountId },
          });
        }
      }

      return true; // Connexion autorisee
    },

    // Appelé quand le JWT est cree ou mis a jour
    // On ajoute le role et l'id dans le token
    async jwt({ token, user }) {
      if (user) {
        // Premiere connexion : on ajoute les infos au token
        token.id = user.id;
        token.role = (user as { role: Role }).role;
      } else if (token.email) {
        // Connexions suivantes : on rafraichit le role depuis la BDD
        // (au cas ou le Super Admin aurait change le role)
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },

    // Appelé quand on accede a la session cote client ou serveur
    // On copie le role et l'id du token vers la session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
});
