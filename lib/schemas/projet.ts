import { z } from "zod/v4";

// --------------------------------------------------------------------------
// Schemas Zod — Validation des projets
// --------------------------------------------------------------------------

export const createProjetSchema = z.object({
  titre: z.string().min(3, "Le titre doit contenir au moins 3 caracteres"),
  description: z.string().min(10, "La description est trop courte"),
  domaineId: z.string().min(1, "Le domaine est requis"),
  statut: z.enum(["en cours", "termine"]).default("en cours"),
  dateDebut: z.string().min(1, "La date de debut est requise"), // Format ISO
  dateFin: z.string().optional(),
  image: z.string().optional(),
  featured: z.boolean().default(false),
  responsable: z.string().optional(),
  zonesGeographiques: z.array(z.string()).default([]), // IDs des zones
  indicateursImpact: z
    .array(
      z.object({
        valeur: z.string().min(1),
        label: z.string().min(1),
      })
    )
    .default([]),
});

export const updateProjetSchema = createProjetSchema.partial();

export type CreateProjetInput = z.infer<typeof createProjetSchema>;
export type UpdateProjetInput = z.infer<typeof updateProjetSchema>;
