import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { error, success } from "@/lib/utils/api-response";
import { headers } from "next/headers";

// --------------------------------------------------------------------------
// API — Login avec Rate Limiting
// --------------------------------------------------------------------------
// POST /api/auth/login
//
// Cette route verifie les identifiants ET applique le rate limiting.
// Le formulaire de login appelle cette route d'abord pour verifier
// le rate limit, puis utilise signIn() de NextAuth pour creer la session.
//
// Pourquoi une route separee au lieu de tout faire dans NextAuth ?
// → NextAuth ne donne pas acces a l'IP dans le provider Credentials.
//   On fait donc la verification ici, et le formulaire n'appelle
//   signIn() que si cette route repond OK.
// --------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
  // Recuperer l'IP du client
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown";

  // Verifier le rate limit
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return error(
      `Trop de tentatives. Reessayez dans ${rateCheck.retryAfter} secondes.`,
      429
    );
  }

  // Lire les identifiants
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return error("Email et mot de passe requis.", 400);
  }

  // Verifier les identifiants
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.passwordHash) {
    return error("Email ou mot de passe incorrect.", 401);
  }

  const isValid = await compare(password, user.passwordHash);

  if (!isValid) {
    return error("Email ou mot de passe incorrect.", 401);
  }

  // Connexion reussie → reinitialiser le rate limit pour cette IP
  resetRateLimit(ip);

  return success({
    ok: true,
    remaining: rateCheck.remaining,
  });
  } catch (err) {
    console.error("Login error:", err);
    return error(
      `Erreur serveur: ${err instanceof Error ? err.message : "inconnue"}`,
      500
    );
  }
}
