import { handlers } from "@/lib/auth";

// --------------------------------------------------------------------------
// Route Handler NextAuth — Catch-all /api/auth/*
// --------------------------------------------------------------------------
// Ce fichier intercepte TOUTES les requetes vers /api/auth/ :
//   - GET /api/auth/signin     → page de connexion NextAuth
//   - POST /api/auth/signin    → soumission du formulaire
//   - GET /api/auth/signout    → deconnexion
//   - GET /api/auth/session    → recuperer la session
//   - POST /api/auth/callback  → callback Google OAuth
//
// On ne code rien ici — NextAuth gere tout automatiquement.
// Les "handlers" viennent de notre config dans lib/auth.ts
// --------------------------------------------------------------------------

export const { GET, POST } = handlers;
