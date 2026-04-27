import { z } from "zod/v4";

export const createDomaineSchema = z.object({
  titre: z.string().min(2, "Le titre doit contenir au moins 2 caracteres"),
  icone: z.string().min(1, "L'icone est requise"),
  description: z.string().min(10, "La description est trop courte"),
  descriptionLongue: z.string().min(10, "La description longue est trop courte"),
  featured: z.boolean().default(false),
  activitesCles: z.array(z.string()).default([]),
  zonesActives: z.array(z.string()).default([]), // IDs des zones
  indicateursImpact: z
    .array(z.object({ valeur: z.string().min(1), label: z.string().min(1) }))
    .default([]),
});

export const updateDomaineSchema = createDomaineSchema.partial();

export type CreateDomaineInput = z.infer<typeof createDomaineSchema>;
export type UpdateDomaineInput = z.infer<typeof updateDomaineSchema>;
