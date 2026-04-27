import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/admin/sidebar";
import { Header } from "@/components/admin/header";

// --------------------------------------------------------------------------
// Layout Admin
// --------------------------------------------------------------------------
// Si l'utilisateur est connecte → affiche sidebar + header + contenu
// Si pas connecte → affiche juste le contenu (= la page de login)
// --------------------------------------------------------------------------

export const metadata = {
  title: "ONG CHADIA — Administration",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Pas connecte → afficher juste les children (page de login)
  if (!session?.user) {
    return <>{children}</>;
  }

  // Connecte → afficher le layout complet
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole={session.user.role} />
      <div className="flex-1 flex flex-col">
        <Header
          userName={session.user.name ?? session.user.email ?? ""}
          userRole={session.user.role}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
