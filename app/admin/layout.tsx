// --------------------------------------------------------------------------
// Layout Admin
// --------------------------------------------------------------------------
// Ce layout enveloppe TOUTES les pages sous /admin/*.
// Pour l'instant il est minimal — on ajoutera la sidebar et le header
// dans l'Epic 4 quand on construira le panel admin complet.
// --------------------------------------------------------------------------

export const metadata = {
  title: "ONG CHADIA — Administration",
  description: "Panel d'administration de l'ONG CHADIA",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
