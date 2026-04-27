import { z } from "zod/v4";

export const createChiffreSchema = z.object({
  valeur: z.string().min(1, "La valeur est requise"),
  unite: z.string().optional(),
  label: z.string().min(1, "Le label est requis"),
  ordre: z.number().int().default(0),
});

export const updateChiffreSchema = createChiffreSchema.partial();
