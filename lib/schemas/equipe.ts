import { z } from "zod/v4";

export const createMembreSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caracteres"),
  poste: z.string().min(2, "Le poste est requis"),
  photo: z.string().optional(),
  institution: z.string().optional(),
  consent: z.boolean().default(false),
  consentDate: z.string().optional(),
  ordre: z.number().int().default(0),
});

export const updateMembreSchema = createMembreSchema.partial();
