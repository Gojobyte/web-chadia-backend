import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { logActivity } from "@/lib/logger";
import { success, created, error } from "@/lib/utils/api-response";
import { createUserSchema } from "@/lib/schemas/user";
import { hash } from "bcryptjs";

// --------------------------------------------------------------------------
// API Admin — Utilisateurs
// --------------------------------------------------------------------------
// GET  /api/admin/users → Liste tous les utilisateurs (Super Admin)
// POST /api/admin/users → Creer un utilisateur (Super Admin)
// --------------------------------------------------------------------------

// --- GET : Liste des utilisateurs ---
export async function GET() {
  const result = await requireRole("SUPER_ADMIN");
  if (result.error) return result.error;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      // On ne renvoie JAMAIS le passwordHash !
    },
    orderBy: { createdAt: "desc" },
  });

  return success({ users });
}

// --- POST : Creer un utilisateur ---
export async function POST(request: Request) {
  const result = await requireRole("SUPER_ADMIN");
  if (result.error) return result.error;

  // Lire le body de la requete
  const body = await request.json();

  // Valider les donnees avec Zod
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.issues[0].message, 400);
  }

  const { name, email, role, password } = parsed.data;

  // Verifier que l'email n'est pas deja utilise
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return error("Un utilisateur avec cet email existe deja.", 409);
  }

  // Generer ou utiliser le mot de passe fourni
  const tempPassword = password ?? generateTempPassword();
  const passwordHash = await hash(tempPassword, 12);

  // Creer l'utilisateur
  const user = await prisma.user.create({
    data: { name, email, role, passwordHash },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  // Logger l'action
  await logActivity({
    userId: result.user.id,
    action: "CREATE",
    entite: "User",
    entiteId: user.id,
    details: { name, email, role },
  });

  return created({ user, tempPassword });
}

// Genere un mot de passe temporaire de 12 caracteres
function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
