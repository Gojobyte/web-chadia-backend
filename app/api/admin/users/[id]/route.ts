import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { logActivity } from "@/lib/logger";
import { success, error, notFound } from "@/lib/utils/api-response";
import { updateUserSchema } from "@/lib/schemas/user";
import { hash } from "bcryptjs";

// --------------------------------------------------------------------------
// API Admin — Utilisateur par ID
// --------------------------------------------------------------------------
// PUT    /api/admin/users/:id → Modifier un utilisateur (Super Admin)
// DELETE /api/admin/users/:id → Supprimer un utilisateur (Super Admin)
// --------------------------------------------------------------------------

// --- PUT : Modifier un utilisateur ---
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole("SUPER_ADMIN");
  if (result.error) return result.error;

  const { id } = await params;

  // Verifier que l'utilisateur existe
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return notFound("Utilisateur");
  }

  // Valider les donnees
  const body = await request.json();
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.issues[0].message, 400);
  }

  const { name, email, role, password } = parsed.data;

  // Si l'email change, verifier qu'il n'est pas deja pris
  if (email && email !== existing.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email } });
    if (emailTaken) {
      return error("Un utilisateur avec cet email existe deja.", 409);
    }
  }

  // Construire les donnees a mettre a jour
  const updateData: Record<string, unknown> = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (role) updateData.role = role;
  if (password) updateData.passwordHash = await hash(password, 12);

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      updatedAt: true,
    },
  });

  await logActivity({
    userId: result.user.id,
    action: "UPDATE",
    entite: "User",
    entiteId: id,
    details: { name, email, role },
  });

  return success({ user });
}

// --- DELETE : Supprimer un utilisateur ---
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole("SUPER_ADMIN");
  if (result.error) return result.error;

  const { id } = await params;

  // Empecher de se supprimer soi-meme
  if (id === result.user.id) {
    return error("Vous ne pouvez pas supprimer votre propre compte.", 400);
  }

  // Verifier que l'utilisateur existe
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return notFound("Utilisateur");
  }

  await prisma.user.delete({ where: { id } });

  await logActivity({
    userId: result.user.id,
    action: "DELETE",
    entite: "User",
    entiteId: id,
    details: { name: existing.name, email: existing.email },
  });

  return success({ message: "Utilisateur supprime." });
}
