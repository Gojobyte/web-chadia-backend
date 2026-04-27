import { z } from "zod/v4";

// --------------------------------------------------------------------------
// Schemas Zod — Validation des utilisateurs
// --------------------------------------------------------------------------
// Zod verifie que les donnees envoyees par le client sont correctes
// AVANT de les sauvegarder en BDD. C'est comme un formulaire qui
// refuse de s'envoyer si un champ est mal rempli.
//
// Exemple : si quelqu'un envoie { email: "pas-un-email" },
// Zod va refuser et renvoyer un message d'erreur clair.
// --------------------------------------------------------------------------

// Schema pour creer un utilisateur
export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caracteres"),
  email: z
    .string()
    .email("L'email n'est pas valide"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EMPLOYE"], {
    error: "Le role doit etre SUPER_ADMIN, ADMIN ou EMPLOYE",
  }),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caracteres")
    .optional(), // Optionnel : si absent, on genere un mdp temporaire
});

// Schema pour modifier un utilisateur
export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EMPLOYE"]).optional(),
  password: z.string().min(8).optional(),
});

// Types inferes depuis les schemas
// Ca evite de definir les types separement — Zod les cree automatiquement
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
