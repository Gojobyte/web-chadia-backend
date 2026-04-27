import { z } from "zod/v4";

export const updateContactInfoSchema = z.object({
  email: z.string().email().optional(),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  horaires: z.string().optional(),
  whatsapp: z.string().optional(),
});

// Schema pour le formulaire de contact public (visiteurs)
export const createMessageSchema = z.object({
  nom: z.string().min(2, "Le nom est requis"),
  email: z.string().email("L'email n'est pas valide"),
  sujet: z.string().min(2, "Le sujet est requis"),
  message: z.string().min(10, "Le message est trop court"),
  fax: z.string().max(0, "").optional(), // Honeypot — doit etre vide
});

export const updateInfosONGSchema = z.object({
  heroTitre: z.string().optional(),
  heroTagline: z.string().optional(),
  heroMetaDescription: z.string().optional(),
  precomBadgeVisible: z.boolean().optional(),
  precomBadgeTexte: z.string().optional(),
  histoire: z.string().optional(),
  vision: z.string().optional(),
  mission: z.string().optional(),
  statutLegalNumero: z.string().optional(),
  statutLegalDate: z.string().optional(),
  statutLegalAutorite: z.string().optional(),
  ctaWhatsappMessage: z.string().optional(),
  valeurs: z
    .array(z.object({ titre: z.string().min(1), description: z.string().min(1) }))
    .optional(),
});
