import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

// --------------------------------------------------------------------------
// Dashboard Admin — /admin
// --------------------------------------------------------------------------
// Page d'accueil du panel admin. Pour l'instant c'est minimal.
// On la completera dans l'Epic 4 avec les widgets (messages, stats, etc.)
//
// C'est un Server Component (pas de "use client") car on accede
// a la session cote serveur avec auth().
// --------------------------------------------------------------------------

export default async function AdminDashboard() {
  const session = await auth();

  // Si pas connecte, rediriger vers la page de connexion
  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bienvenue, {session.user.name ?? session.user.email}
        </h1>
        <p className="text-gray-500 mb-8">
          Role : {session.user.role}
        </p>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Dashboard
          </h2>
          <p className="text-gray-600">
            Le panel d&apos;administration est en construction.
            Les fonctionnalites arrivent dans les prochaines stories !
          </p>
        </div>
      </div>
    </div>
  );
}
