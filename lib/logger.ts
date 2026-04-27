import { prisma } from "@/lib/prisma";

// --------------------------------------------------------------------------
// Service de logging en BDD
// --------------------------------------------------------------------------
// Chaque action importante (creer, modifier, supprimer) est enregistree
// dans la table logs_activite. Ca permet au Super Admin de savoir :
// "Qui a fait quoi, et quand ?"
//
// Exemple :
//   await logActivity({
//     userId: session.user.id,
//     action: "CREATE",
//     entite: "Projet",
//     entiteId: projet.id,
//     details: { titre: "Nouveau projet" },
//   });
// --------------------------------------------------------------------------

interface LogParams {
  userId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  entite: string;
  entiteId: string;
  details?: Record<string, unknown>;
}

export async function logActivity(params: LogParams) {
  await prisma.logActivite.create({
    data: {
      userId: params.userId,
      action: params.action,
      entite: params.entite,
      entiteId: params.entiteId,
      details: params.details ? JSON.stringify(params.details) : null,
    },
  });
}
