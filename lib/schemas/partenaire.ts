import { z } from "zod/v4";

export const createPartenaireSchema = z.object({
  nom: z.string().min(2, "Le nom est requis"),
  logo: z.string().min(1, "Le logo est requis"),
  url: z.string().optional(),
  ordre: z.number().int().default(0),
});

export const updatePartenaireSchema = createPartenaireSchema.partial();
