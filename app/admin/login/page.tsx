import { Suspense } from "react";
import { LoginForm } from "./login-form";

// --------------------------------------------------------------------------
// Page de Connexion — /admin/login
// --------------------------------------------------------------------------
// La page est un Server Component qui enveloppe le formulaire (Client
// Component) dans <Suspense>. C'est requis par Next.js car le formulaire
// utilise useSearchParams() qui a besoin des parametres d'URL.
// --------------------------------------------------------------------------

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Chargement...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
