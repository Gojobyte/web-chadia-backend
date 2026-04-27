"use client";

// --------------------------------------------------------------------------
// Formulaire de Connexion (Client Component)
// --------------------------------------------------------------------------
// Separe de page.tsx car il utilise useSearchParams() et des interactions.
// --------------------------------------------------------------------------

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Si l'utilisateur a ete redirige ici, on le renverra a la page d'origine
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  // Etats du formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Soumission du formulaire email + mot de passe
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Etape 1 : Verifier le rate limit + les identifiants
    try {
      const checkRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const checkData = await checkRes.json();

      if (!checkRes.ok) {
        setError(checkData.error);
        setLoading(false);
        return;
      }
    } catch {
      setError("Erreur de connexion au serveur.");
      setLoading(false);
      return;
    }

    // Etape 2 : Creer la session NextAuth
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }

    router.push(callbackUrl);
  }

  // Connexion Google
  function handleGoogleSignIn() {
    signIn("google", { callbackUrl });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">ONG CHADIA</h1>
          <p className="text-gray-500 mt-1">Administration</p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div
            className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Erreur NextAuth (ex: compte Google non autorise) */}
        {searchParams.get("error") && (
          <div
            className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm"
            role="alert"
          >
            {searchParams.get("error") === "AccessDenied"
              ? "Acces refuse. Votre compte n'est pas autorise."
              : "Une erreur est survenue. Veuillez reessayer."}
          </div>
        )}

        {/* Formulaire Email + Mot de passe */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        {/* Separateur */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300" />
          <span className="px-3 text-sm text-gray-500">ou</span>
          <div className="flex-1 border-t border-gray-300" />
        </div>

        {/* Bouton Google */}
        <button
          onClick={handleGoogleSignIn}
          type="button"
          className="w-full py-2 px-4 border border-gray-300 rounded-md font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Se connecter avec Google
        </button>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Acces reserve au personnel autorise de l&apos;ONG CHADIA
        </p>
      </div>
    </div>
  );
}
