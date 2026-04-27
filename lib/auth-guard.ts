import { auth } from "@/lib/auth";
import { unauthorized, forbidden } from "@/lib/utils/api-response";
import type { Role } from "@/app/generated/prisma/client";

// --------------------------------------------------------------------------
// Auth Guard — Verification des permissions dans les API Routes
// --------------------------------------------------------------------------
// Ce helper simplifie la protection des endpoints API.
//
// Au lieu de repeter dans chaque route :
//   const session = await auth();
//   if (!session) return unauthorized();
//   if (session.user.role !== "ADMIN") return forbidden();
//
// On ecrit simplement :
//   const result = await requireRole("ADMIN");
//   if (result.error) return result.error;
//   const { user } = result;
// --------------------------------------------------------------------------

// Hierarchie des roles : SUPER_ADMIN > ADMIN > EMPLOYE
const ROLE_LEVEL: Record<Role, number> = {
  SUPER_ADMIN: 3,
  ADMIN: 2,
  EMPLOYE: 1,
};

interface AuthSuccess {
  error: null;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: Role;
  };
}

interface AuthError {
  error: Response;
  user: null;
}

type AuthResult = AuthSuccess | AuthError;

/**
 * Verifie que l'utilisateur est connecte et a le role minimum requis.
 *
 * @param minimumRole - Le role minimum pour acceder a la ressource
 * @returns L'utilisateur si autorise, ou une reponse d'erreur
 *
 * Exemples :
 *   requireRole("EMPLOYE")     → tout utilisateur connecte
 *   requireRole("ADMIN")       → Admin ou Super Admin
 *   requireRole("SUPER_ADMIN") → Super Admin uniquement
 */
export async function requireRole(minimumRole: Role): Promise<AuthResult> {
  const session = await auth();

  // Pas de session = pas connecte
  if (!session?.user) {
    return { error: unauthorized(), user: null };
  }

  const userRole = session.user.role;

  // Verifier que le role de l'utilisateur est >= au role minimum
  if (ROLE_LEVEL[userRole] < ROLE_LEVEL[minimumRole]) {
    return { error: forbidden(), user: null };
  }

  return { error: null, user: session.user };
}
