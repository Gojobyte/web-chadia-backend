import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

// --------------------------------------------------------------------------
// Dashboard Admin — /admin
// --------------------------------------------------------------------------

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  // Charger les stats en parallele (plus rapide)
  const [
    projetsCount,
    domainesCount,
    membresCount,
    messagesNonLus,
    derniersProjets,
    derniersLogs,
  ] = await Promise.all([
    prisma.projet.count(),
    prisma.domaine.count(),
    prisma.membreEquipe.count(),
    prisma.messageContact.count({ where: { statut: "non_lu" } }),
    prisma.projet.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: { id: true, titre: true, statut: true, updatedAt: true },
    }),
    session.user.role === "SUPER_ADMIN"
      ? prisma.logActivite.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true } } },
        })
      : [],
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Projets" value={projetsCount} href="/admin/projets" />
        <StatCard label="Domaines" value={domainesCount} href="/admin/domaines" />
        <StatCard label="Equipe" value={membresCount} href="/admin/equipe" />
        <StatCard
          label="Messages non lus"
          value={messagesNonLus}
          href="/admin/contact"
          highlight={messagesNonLus > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Derniers projets modifies */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Derniers projets modifies
          </h2>
          {derniersProjets.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun projet.</p>
          ) : (
            <ul className="space-y-3">
              {derniersProjets.map((p) => (
                <li key={p.id} className="flex items-center justify-between">
                  <Link
                    href={`/admin/projets/${p.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {p.titre}
                  </Link>
                  <span className="text-xs text-gray-400">
                    {new Date(p.updatedAt).toLocaleDateString("fr-FR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Activite recente (Super Admin) */}
        {session.user.role === "SUPER_ADMIN" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Activite recente
            </h2>
            {derniersLogs.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucune activite.</p>
            ) : (
              <ul className="space-y-3">
                {derniersLogs.map((log) => (
                  <li key={log.id} className="text-sm">
                    <span className="font-medium">{log.user.name}</span>
                    <span className="text-gray-500">
                      {" "}a {log.action === "CREATE" ? "cree" : log.action === "UPDATE" ? "modifie" : "supprime"}{" "}
                    </span>
                    <span className="text-gray-700">{log.entite}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      {new Date(log.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Composant carte statistique
function StatCard({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow ${
        highlight ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${highlight ? "text-blue-600" : "text-gray-900"}`}>
        {value}
      </p>
    </Link>
  );
}
