"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// --------------------------------------------------------------------------
// Sidebar — Navigation laterale du panel admin
// --------------------------------------------------------------------------

interface NavItem {
  label: string;
  href: string;
  icon: string;
  superAdminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Projets", href: "/admin/projets", icon: "📁" },
  { label: "Domaines", href: "/admin/domaines", icon: "🏷️" },
  { label: "Equipe", href: "/admin/equipe", icon: "👥" },
  { label: "Partenaires", href: "/admin/partenaires", icon: "🤝" },
  { label: "Chiffres cles", href: "/admin/chiffres", icon: "📈" },
  { label: "A propos", href: "/admin/a-propos", icon: "ℹ️" },
  { label: "Contact", href: "/admin/contact", icon: "✉️" },
  { label: "Utilisateurs", href: "/admin/utilisateurs", icon: "🔐", superAdminOnly: true },
  { label: "Logs", href: "/admin/logs", icon: "📋", superAdminOnly: true },
];

interface SidebarProps {
  userRole: string;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter(
    (item) => !item.superAdminOnly || userRole === "SUPER_ADMIN"
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex-shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900">ONG CHADIA</h1>
        <p className="text-xs text-gray-500 mt-1">Administration</p>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
